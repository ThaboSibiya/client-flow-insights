import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const testOAuthConnection = async (providerId: string, accessToken: string): Promise<boolean> => {
  try {
    if (providerId === 'google-gmail') {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.ok;
      
    } else if (providerId === 'microsoft-outlook') {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/inbox', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.ok;
    }
    
    return false;
  } catch (error) {
    console.error('OAuth connection test failed:', error);
    return false;
  }
};

const testImapConnection = async (config: any): Promise<boolean> => {
  // For IMAP connections, we would need to implement IMAP protocol testing
  // For now, we'll do basic validation
  try {
    const { serverHost, serverPort, username, password } = config.settings;
    
    if (!serverHost || !username || !password) {
      return false;
    }
    
    // Basic port validation
    const port = parseInt(serverPort) || 993;
    if (port < 1 || port > 65535) {
      return false;
    }
    
    // In a real implementation, we would test the actual IMAP connection
    // For now, return true if basic validation passes
    return true;
    
  } catch (error) {
    console.error('IMAP connection test failed:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { config } = await req.json();
    
    if (!config || !config.providerId) {
      return new Response(
        JSON.stringify({ error: "Configuration is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let success = false;

    // Check if provider requires OAuth
    if (config.providerId === 'google-gmail' || config.providerId === 'microsoft-outlook') {
      // Check if OAuth tokens exist
      const { data: tokenData, error: tokenError } = await supabase
        .from('email_oauth_tokens')
        .select('access_token, expires_at')
        .eq('user_id', user.id)
        .eq('provider_id', config.providerId)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "OAuth authorization required. Please complete the OAuth setup first." 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "OAuth token expired. Please re-authorize your account." 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      success = await testOAuthConnection(config.providerId, tokenData.access_token);
      
    } else {
      // Test IMAP or other direct connections
      success = await testImapConnection(config);
    }

    return new Response(
      JSON.stringify({ success }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Email connection test error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Connection test failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);