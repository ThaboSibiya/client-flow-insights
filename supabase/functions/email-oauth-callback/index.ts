import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const allowedOrigins = [
  'https://quikle-innovation-suite.lovable.app',
  'https://id-preview--e1036b92-283a-4a65-9473-d759ed300ea1.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// Retrieve OAuth credentials securely from vault
const getSecureCredentials = async (
  userId: string,
  providerId: string,
  supabase: any
): Promise<{ clientId: string; clientSecret: string; redirectUri: string }> => {
  // First check for user-specific OAuth app configuration
  const { data: userOAuthApp } = await supabase
    .from('user_oauth_apps')
    .select('client_id, redirect_uri')
    .eq('user_id', userId)
    .eq('provider_id', providerId)
    .single();

  if (userOAuthApp) {
    // Retrieve client_secret from vault using the secure function
    const secretName = `oauth_secret_${userId}_${providerId}`;
    const { data: clientSecret, error: vaultError } = await supabase.rpc(
      'vault_read_secret',
      { secret_name: secretName }
    );

    if (vaultError || !clientSecret) {
      console.error('Failed to retrieve secret from vault:', vaultError);
      throw new Error('Failed to retrieve OAuth credentials');
    }

    return {
      clientId: userOAuthApp.client_id,
      clientSecret: clientSecret,
      redirectUri: userOAuthApp.redirect_uri
    };
  }

  // Fall back to system configuration
  let clientId: string;
  let clientSecret: string;
  
  if (providerId === 'google-gmail') {
    clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
    clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
  } else if (providerId === 'microsoft-outlook') {
    clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID') || '';
    clientSecret = Deno.env.get('MICROSOFT_OAUTH_CLIENT_SECRET') || '';
  } else {
    throw new Error('Unsupported provider');
  }

  if (!clientId || !clientSecret) {
    throw new Error('OAuth credentials not configured');
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/email-oauth-callback`
  };
};

const exchangeCodeForTokens = async (
  code: string, 
  providerId: string, 
  userId: string,
  supabase: any
) => {
  const credentials = await getSecureCredentials(userId, providerId, supabase);
  const { clientId, clientSecret, redirectUri } = credentials;
  
  if (providerId === 'google-gmail') {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }
    
    return await response.json();
    
  } else if (providerId === 'microsoft-outlook') {
    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send'
      }).toString()
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }
    
    return await response.json();
  }
  
  throw new Error('Unsupported provider');
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Authorization Failed</title></head>
          <body>
            <h1>Authorization Failed</h1>
            <p>Error: ${error}</p>
            <script>
              setTimeout(() => {
                window.opener?.postMessage({ success: false, error: '${error}' }, '*');
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
        `,
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    if (!code || !state) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid Request</title></head>
          <body>
            <h1>Invalid Request</h1>
            <p>Missing required parameters</p>
          </body>
        </html>
        `,
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Parse state: format is "state:userId:providerId"
    const [stateToken, userId, providerId] = state.split(':');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate state token
    const { data: oauthState, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', stateToken)
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single();

    if (stateError || !oauthState) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid State</title></head>
          <body>
            <h1>Invalid or Expired State</h1>
            <p>Please try again</p>
            <script>
              setTimeout(() => {
                window.opener?.postMessage({ success: false, error: 'Invalid state' }, '*');
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
        `,
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, providerId, userId, supabase);

    // Store tokens
    const { error: tokenError } = await supabase
      .from('email_oauth_tokens')
      .upsert({
        user_id: userId,
        provider_id: providerId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider_id'
      });

    if (tokenError) {
      console.error('Failed to store tokens:', tokenError);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Failed to Store Tokens</h1>
            <p>Please try again</p>
            <script>
              setTimeout(() => {
                window.opener?.postMessage({ success: false, error: 'Failed to store tokens' }, '*');
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
        `,
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // Clean up OAuth state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state_token', stateToken);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; }
            .success { color: #16a34a; font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="success">✓</div>
          <h1>Authorization Successful!</h1>
          <p>You can close this window now.</p>
          <script>
            window.opener?.postMessage({ success: true }, '*');
            setTimeout(() => window.close(), 1500);
          </script>
        </body>
      </html>
      `,
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Authorization Error</h1>
          <p>${error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
          <script>
            setTimeout(() => {
              window.opener?.postMessage({ success: false, error: '${error instanceof Error ? error.message : String(error)}' }, '*');
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
      `,
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );
  }
};

serve(handler);
