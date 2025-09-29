import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const config = getOAuthConfig();
    const state = generateState();
    
    let authUrl: string;
    
    if (providerId === 'google-gmail') {
      const googleConfig = config.google;
      if (!googleConfig.clientId) {
        return new Response(
          JSON.stringify({ error: "Google OAuth not configured. Please contact administrator." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const params = new URLSearchParams({
        client_id: googleConfig.clientId,
        redirect_uri: googleConfig.redirectUri,
        scope: googleConfig.scope,
        response_type: 'code',
        state: `${state}:${user.id}:${providerId}`,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
    } else if (providerId === 'microsoft-outlook') {
      const msConfig = config.microsoft;
      if (!msConfig.clientId) {
        return new Response(
          JSON.stringify({ error: "Microsoft OAuth not configured. Please contact administrator." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const params = new URLSearchParams({
        client_id: msConfig.clientId,
        redirect_uri: msConfig.redirectUri,
        scope: msConfig.scope,
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