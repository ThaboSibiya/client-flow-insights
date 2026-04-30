// Returns the CyberLSI MFA redirect URL for the "Login with CyberLSI" button.
// The MFA flow is browser-redirect only: we send the user to CYBERLSI_MFA_BASE_URL
// with a `callback` parameter pointing back to our /auth page, which reads the
// login identifier from the query string CyberLSI appends on return.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RedirectRequest {
  callbackUrl?: string;
}

const ALLOWED_CALLBACK_HOSTS = new Set([
  "crm.quikle.co.za",
  "quikle-innovation-suite.lovable.app",
  "id-preview--e1036b92-283a-4a65-9473-d759ed300ea1.lovable.app",
  "localhost",
  "127.0.0.1",
]);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const mfaBase = Deno.env.get("CYBERLSI_MFA_BASE_URL");
  if (!mfaBase) {
    return new Response(
      JSON.stringify({ error: "CyberLSI MFA URL is not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let body: RedirectRequest = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate caller-supplied callback URL against an allow-list of hosts.
  let callbackUrl: string | null = null;
  if (body.callbackUrl) {
    try {
      const u = new URL(body.callbackUrl);
      if (
        (u.protocol === "https:" || u.protocol === "http:") &&
        ALLOWED_CALLBACK_HOSTS.has(u.hostname)
      ) {
        callbackUrl = u.toString();
      }
    } catch {
      // ignore — fall back below
    }
  }

  // Build the redirect URL. We append common parameter names so CyberLSI
  // picks up whichever they expect.
  let redirectUrl: URL;
  try {
    redirectUrl = new URL(mfaBase);
  } catch {
    return new Response(
      JSON.stringify({ error: "CyberLSI MFA URL is malformed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (callbackUrl) {
    redirectUrl.searchParams.set("callback", callbackUrl);
    redirectUrl.searchParams.set("redirect_uri", callbackUrl);
    redirectUrl.searchParams.set("returnUrl", callbackUrl);
  }

  return new Response(
    JSON.stringify({ redirectUrl: redirectUrl.toString() }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
