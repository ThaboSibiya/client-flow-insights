import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OAuthCredentials {
  provider_id: string;
  client_id: string;
  client_secret: string;
  redirect_uri?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Create client with user's auth token for authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service role client for vault operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case "store": {
        const { provider_id, client_id, client_secret, redirect_uri } = params as OAuthCredentials;
        
        if (!provider_id || !client_id || !client_secret) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate a unique secret name for this user's OAuth credentials
        const secretName = `oauth_secret_${user.id}_${provider_id}`;

        // Store the client_secret in Supabase Vault
        const { error: vaultError } = await supabaseAdmin.rpc('vault_insert_secret', {
          new_secret: client_secret,
          new_name: secretName,
          new_description: `OAuth client secret for ${provider_id} - User: ${user.id}`
        });

        // If secret exists, update it instead
        if (vaultError?.message?.includes('duplicate')) {
          // Delete old secret first
          await supabaseAdmin.rpc('vault_delete_secret', { secret_name: secretName });
          
          // Insert new secret
          const { error: retryError } = await supabaseAdmin.rpc('vault_insert_secret', {
            new_secret: client_secret,
            new_name: secretName,
            new_description: `OAuth client secret for ${provider_id} - User: ${user.id}`
          });
          
          if (retryError) {
            console.error('Vault retry error:', retryError);
            throw new Error('Failed to store secret in vault');
          }
        } else if (vaultError) {
          console.error('Vault error:', vaultError);
          throw new Error('Failed to store secret in vault');
        }

        // Store non-sensitive OAuth app info in database (without client_secret)
        const defaultRedirectUri = `${supabaseUrl}/functions/v1/email-oauth-callback`;
        
        const { error: dbError } = await supabaseAdmin
          .from('user_oauth_apps')
          .upsert({
            user_id: user.id,
            provider_id,
            client_id,
            client_secret: '***VAULT_PROTECTED***', // Placeholder indicating secret is in vault
            redirect_uri: redirect_uri || defaultRedirectUri,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,provider_id'
          });

        if (dbError) {
          console.error('DB error:', dbError);
          throw new Error('Failed to store OAuth configuration');
        }

        // Log security event
        await supabaseAdmin.rpc('log_security_event', {
          p_user_id: user.id,
          p_action: 'oauth_credentials_stored',
          p_resource_type: 'oauth_app',
          p_resource_id: provider_id,
          p_success: true,
          p_metadata: { provider_id, has_client_id: !!client_id }
        });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retrieve": {
        const { provider_id } = params;
        
        if (!provider_id) {
          return new Response(
            JSON.stringify({ error: "Provider ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get OAuth app info from database
        const { data: oauthApp, error: dbError } = await supabaseAdmin
          .from('user_oauth_apps')
          .select('client_id, redirect_uri')
          .eq('user_id', user.id)
          .eq('provider_id', provider_id)
          .single();

        if (dbError || !oauthApp) {
          return new Response(
            JSON.stringify({ error: "OAuth app not configured" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Retrieve client_secret from vault
        const secretName = `oauth_secret_${user.id}_${provider_id}`;
        const { data: secretData, error: vaultError } = await supabaseAdmin.rpc(
          'vault_read_secret',
          { secret_name: secretName }
        );

        if (vaultError || !secretData) {
          console.error('Vault read error:', vaultError);
          return new Response(
            JSON.stringify({ error: "Failed to retrieve credentials" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            client_id: oauthApp.client_id,
            client_secret: secretData,
            redirect_uri: oauthApp.redirect_uri
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        const { provider_id } = params;
        
        if (!provider_id) {
          return new Response(
            JSON.stringify({ error: "Provider ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete from vault
        const secretName = `oauth_secret_${user.id}_${provider_id}`;
        await supabaseAdmin.rpc('vault_delete_secret', { secret_name: secretName });

        // Delete from database
        await supabaseAdmin
          .from('user_oauth_apps')
          .delete()
          .eq('user_id', user.id)
          .eq('provider_id', provider_id);

        // Log security event
        await supabaseAdmin.rpc('log_security_event', {
          p_user_id: user.id,
          p_action: 'oauth_credentials_deleted',
          p_resource_type: 'oauth_app',
          p_resource_id: provider_id,
          p_success: true,
          p_metadata: { provider_id }
        });

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check": {
        const { provider_id } = params;
        
        if (!provider_id) {
          return new Response(
            JSON.stringify({ error: "Provider ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if OAuth app is configured
        const { data: oauthApp } = await supabaseAdmin
          .from('user_oauth_apps')
          .select('client_id, redirect_uri')
          .eq('user_id', user.id)
          .eq('provider_id', provider_id)
          .single();

        return new Response(
          JSON.stringify({ 
            configured: !!oauthApp,
            client_id: oauthApp?.client_id,
            redirect_uri: oauthApp?.redirect_uri
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("Secure OAuth credentials error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
