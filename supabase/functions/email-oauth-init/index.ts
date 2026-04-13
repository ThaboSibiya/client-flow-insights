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

interface OAuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
  microsoft: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
}

const getOAuthConfig = (): OAuthConfig => {
  const baseUrl = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
  
  return {
    google: {
      clientId: Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || "",
      redirectUri: `${baseUrl}/functions/v1/email-oauth-callback`,
      scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send"
    },
    microsoft: {
      clientId: Deno.env.get("MICROSOFT_OAUTH_CLIENT_ID") || "",
      redirectUri: `${baseUrl}/functions/v1/email-oauth-callback`,
      scope: "https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send"
    }
  };
};

const generateState = (): string => {
  return crypto.randomUUID();
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

    const { providerId } = await req.json();
    
    if (!providerId) {
      return new Response(
        JSON.stringify({ error: "Provider ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for user-specific OAuth app configuration first
    const { data: userOAuthApp } = await supabase
      .from('user_oauth_apps')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_id', providerId)
      .single();

    const config = getOAuthConfig();
    const state = generateState();
    
    let authUrl: string;
    let clientId: string;
    let redirectUri: string;
    let scope: string;
    
    if (providerId === 'google-gmail') {
      // Use user's OAuth app if available, otherwise fall back to system config
      if (userOAuthApp) {
        clientId = userOAuthApp.client_id;
        redirectUri = userOAuthApp.redirect_uri;
        scope = config.google.scope;
      } else {
        const googleConfig = config.google;
        if (!googleConfig.clientId) {
          return new Response(
            JSON.stringify({ 
              error: "Please configure your own OAuth app credentials to connect your Gmail account.",
              hint: "Enter your Client ID and Client Secret in the setup form."
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        clientId = googleConfig.clientId;
        redirectUri = googleConfig.redirectUri;
        scope = googleConfig.scope;
      }
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: `${state}:${user.id}:${providerId}`,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
    } else if (providerId === 'microsoft-outlook') {
      // Use user's OAuth app if available, otherwise fall back to system config
      if (userOAuthApp) {
        clientId = userOAuthApp.client_id;
        redirectUri = userOAuthApp.redirect_uri;
        scope = config.microsoft.scope;
      } else {
        const msConfig = config.microsoft;
        if (!msConfig.clientId) {
          return new Response(
            JSON.stringify({ 
              error: "Please configure your own OAuth app credentials to connect your Outlook account.",
              hint: "Enter your Client ID and Client Secret in the setup form."
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        clientId = msConfig.clientId;
        redirectUri = msConfig.redirectUri;
        scope = msConfig.scope;
      }
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: `${state}:${user.id}:${providerId}`,
        response_mode: 'query'
      });
      
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
      
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store state for validation
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state_token: state,
        user_id: user.id,
        provider_id: providerId,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

    if (stateError) {
      console.error('Failed to store OAuth state:', stateError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate OAuth flow" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ authUrl }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("OAuth init error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);