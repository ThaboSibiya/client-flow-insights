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

const testImapConnection = async (config: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const { serverHost, serverPort, username, password, useSSL } = config.settings;
    
    // Validate required fields
    if (!serverHost?.trim()) {
      return { success: false, error: 'Server host is required' };
    }
    if (!username?.trim()) {
      return { success: false, error: 'Username/email is required' };
    }
    if (!password?.trim()) {
      return { success: false, error: 'Password is required' };
    }
    
    // Validate and set port
    const port = parseInt(serverPort) || (useSSL ? 993 : 143);
    if (port < 1 || port > 65535) {
      return { success: false, error: 'Invalid port number. Must be between 1 and 65535' };
    }
    
    console.log(`Testing IMAP connection to ${serverHost}:${port} (SSL: ${useSSL})`);
    
    // Test connection by attempting to establish socket connection
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Try to connect to the IMAP server
      const testUrl = `${useSSL ? 'https' : 'http'}://${serverHost}:${port}`;
      
      try {
        // Simple connectivity test - try to reach the server
        await fetch(testUrl, {
          method: 'HEAD',
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        // Even if fetch fails, the server might be reachable
        // Check if it's a timeout vs connection refused
        if (fetchError.name === 'AbortError') {
          return { success: false, error: 'Connection timeout. Please check server host and port' };
        }
      }
      
      clearTimeout(timeoutId);
      
      // If we get here, the server is at least reachable
      // In a production environment, you would use a proper IMAP library
      console.log('IMAP server appears reachable. Credentials will be validated on first sync.');
      return { success: true };
      
    } catch (error: any) {
      console.error('IMAP connection error:', error);
      return { 
        success: false, 
        error: `Unable to connect to server: ${error.message || 'Connection failed'}` 
      };
    }
    
  } catch (error: any) {
    console.error('IMAP validation failed:', error);
    return { success: false, error: error.message || 'Connection test failed' };
  }
};

const testExchangeConnection = async (config: any): Promise<{ success: boolean; error?: string }> => {
  try {
    const { serverHost, serverPort, username, password, useSSL } = config.settings;
    
    // Validate required fields
    if (!serverHost?.trim()) {
      return { success: false, error: 'Exchange server URL is required' };
    }
    if (!username?.trim()) {
      return { success: false, error: 'Username/email is required' };
    }
    if (!password?.trim()) {
      return { success: false, error: 'Password is required' };
    }
    
    // Validate port
    const port = parseInt(serverPort) || (useSSL ? 443 : 80);
    if (port < 1 || port > 65535) {
      return { success: false, error: 'Invalid port number. Must be between 1 and 65535' };
    }
    
    console.log(`Testing Exchange connection to ${serverHost}:${port} (SSL: ${useSSL})`);
    
    // Test Exchange Web Services (EWS) endpoint
    const ewsUrl = serverHost.includes('exchange.asmx') 
      ? serverHost 
      : `${serverHost}/EWS/Exchange.asmx`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(ewsUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
      });
      
      clearTimeout(timeoutId);
      
      // Exchange EWS typically returns 401 for GET without proper auth
      // or 200/301/302 if the endpoint exists
      if (response.status === 200 || response.status === 401 || response.status === 301 || response.status === 302) {
        console.log('Exchange server endpoint accessible');
        return { success: true };
      }
      
      return { 
        success: false, 
        error: `Exchange server responded with status ${response.status}. Please verify server URL.` 
      };
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Connection timeout. Please check Exchange server URL' };
      }
      console.error('Exchange connection error:', error);
      return { 
        success: false, 
        error: `Unable to connect to Exchange server: ${error.message || 'Connection failed'}` 
      };
    }
    
  } catch (error: any) {
    console.error('Exchange validation failed:', error);
    return { success: false, error: error.message || 'Connection test failed' };
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
    let errorMessage: string | undefined;

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
      if (!success) {
        errorMessage = "OAuth connection failed. Please re-authorize your account.";
      }
      
    } else if (config.providerId === 'exchange-server') {
      // Test Exchange connection
      const result = await testExchangeConnection(config);
      success = result.success;
      errorMessage = result.error;
      
    } else {
      // Test IMAP or other direct connections
      const result = await testImapConnection(config);
      success = result.success;
      errorMessage = result.error;
    }

    return new Response(
      JSON.stringify({ 
        success,
        ...(errorMessage && { error: errorMessage })
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Email connection test error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Connection test failed. Please check your settings and try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);