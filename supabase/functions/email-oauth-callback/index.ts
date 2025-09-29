import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const exchangeCodeForTokens = async (code: string, providerId: string) => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
  
  if (providerId === 'google-gmail') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || "",
        client_secret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") || "",
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/functions/v1/email-oauth-callback`,
      }),
    });
    
    return await response.json();
    
  } else if (providerId === 'microsoft-outlook') {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID") || "",
        client_secret: Deno.env.get("MICROSOFT_OAUTH_CLIENT_SECRET") || "",
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseUrl}/functions/v1/email-oauth-callback`,
      }),
    });
    
    return await response.json();
  }
  
  throw new Error('Unsupported provider');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Authorization Failed</title></head>
          <body>
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
              <h2>Authorization Failed</h2>
              <p>Error: ${error}</p>
              <p>Please close this window and try again.</p>
            </div>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    }

    if (!code || !state) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Invalid Request</title></head>
          <body>
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
              <h2>Invalid Request</h2>
              <p>Missing authorization code or state parameter.</p>
              <p>Please close this window and try again.</p>
            </div>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse state: format is "state_token:user_id:provider_id"
    const [stateToken, userId, providerId] = state.split(':');

    // Validate state
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', stateToken)
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateData) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Invalid State</title></head>
          <body>
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
              <h2>Invalid or Expired Session</h2>
              <p>Please close this window and try again.</p>
            </div>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, providerId);
    
    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Store tokens securely
    const { error: tokenError } = await supabase
      .from('email_oauth_tokens')
      .upsert({
        user_id: userId,
        provider_id: providerId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        scope: tokens.scope,
        token_type: tokens.token_type || 'Bearer'
      }, {
        onConflict: 'user_id,provider_id'
      });

    if (tokenError) {
      throw new Error('Failed to store OAuth tokens');
    }

    // Clean up state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state_token', stateToken);

    // Success page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Successful</title></head>
        <body>
          <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h2>✅ Authorization Successful!</h2>
            <p>Your email account has been successfully connected to Quikle.</p>
            <p>You can now close this window and return to the application.</p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Close Window
            </button>
          </div>
          <script>
            // Post message to parent window
            if (window.opener) {
              window.opener.postMessage({ success: true, providerId: '${providerId}' }, '*');
            }
            // Auto-close after 5 seconds
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>Authorization Error</title></head>
        <body>
          <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h2>❌ Authorization Error</h2>
            <p>An error occurred during authorization: ${error.message}</p>
            <p>Please close this window and try again.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ success: false, error: '${error.message}' }, '*');
            }
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }
};

serve(handler);