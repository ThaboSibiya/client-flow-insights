// CyberLSI authentication validation edge function
// Handles the "CyberLSI mobile -> CRM browser" login flow.
// Receives an authParam from the CRM callback page, validates it with CyberLSI,
// and (if valid + the matched profile is opt-in) returns a Supabase magic-link
// session URL so the user is signed in.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ValidateRequest {
  authParam: string;
  bizParam?: Record<string, unknown>;
}

interface CyberLSIValidationResponse {
  userId: string | null;
  appId: string | null;
  isValid: boolean;
  message: string | null;
  version: string;
  bizParam: Record<string, unknown> | null;
  duplicateAttempt: boolean;
}

// --- Token cache (per warm instance) ---
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const tokenUrl = Deno.env.get("CYBERLSI_TOKEN_URL");
  const clientId = Deno.env.get("CYBERLSI_CLIENT_ID");
  const clientSecret = Deno.env.get("CYBERLSI_CLIENT_SECRET");
  const scope = Deno.env.get("CYBERLSI_SCOPE") ?? "";

  if (!tokenUrl || !clientId || !clientSecret) {
    throw new Error("CyberLSI credentials are not configured");
  }

  // Reuse cached token if still valid (60s safety window)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  if (scope) body.set("scope", scope);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get CyberLSI token: ${res.status} ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function validateAuthParam(
  authParam: string,
  bizParam?: Record<string, unknown>,
): Promise<CyberLSIValidationResponse> {
  const baseUrl = Deno.env.get("CYBERLSI_BASE_URL");
  const routeMask = Deno.env.get("CYBERLSI_ROUTE_MASK");

  if (!baseUrl || !routeMask) {
    throw new Error("CyberLSI base URL / route mask not configured");
  }

  const token = await getAccessToken();

  const url = `${baseUrl.replace(/\/$/, "")}/api/v1.0/${routeMask}/psw/validate`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "1.0",
      authParam,
      bizParam: bizParam ?? null,
    }),
  });

  // CyberLSI returns 401 for invalid identifiers — read the body either way
  const data = await res.json() as CyberLSIValidationResponse;
  return data;
}

async function hashAuthParam(authParam: string): Promise<string> {
  const buf = new TextEncoder().encode(authParam);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  let body: ValidateRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.authParam || typeof body.authParam !== "string") {
    return new Response(JSON.stringify({ error: "authParam is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authParamHash = await hashAuthParam(body.authParam);

  try {
    const validation = await validateAuthParam(body.authParam, body.bizParam);

    if (!validation.isValid || !validation.userId) {
      await supabaseAdmin.from("cyberlsi_auth_log").insert({
        cyberlsi_user_id: validation.userId,
        auth_param_hash: authParamHash,
        is_valid: false,
        duplicate_attempt: validation.duplicateAttempt ?? false,
        ip_address: ip,
        user_agent: userAgent,
        error_message: validation.message ?? "Invalid authParam",
        metadata: { appId: validation.appId },
      });

      return new Response(
        JSON.stringify({
          isValid: false,
          message: validation.message ?? "Validation failed",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Look up the CRM user that has linked this CyberLSI userId AND opted in
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, cyberlsi_enabled")
      .eq("cyberlsi_user_id", validation.userId)
      .eq("cyberlsi_enabled", true)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
    }

    if (!profile || !profile.email) {
      await supabaseAdmin.from("cyberlsi_auth_log").insert({
        cyberlsi_user_id: validation.userId,
        auth_param_hash: authParamHash,
        is_valid: true,
        duplicate_attempt: validation.duplicateAttempt ?? false,
        ip_address: ip,
        user_agent: userAgent,
        error_message: "No opted-in CRM user linked to this CyberLSI account",
        metadata: { appId: validation.appId },
      });

      return new Response(
        JSON.stringify({
          isValid: true,
          linked: false,
          message:
            "Your CyberLSI account is valid but is not linked to a CRM user. Sign in normally and link CyberLSI from your profile.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate a magic link to sign the user in on the CRM browser
    const { data: linkData, error: linkError } = await supabaseAdmin.auth
      .admin.generateLink({
        type: "magiclink",
        email: profile.email,
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Magic link error:", linkError);
      await supabaseAdmin.from("cyberlsi_auth_log").insert({
        user_id: profile.id,
        cyberlsi_user_id: validation.userId,
        auth_param_hash: authParamHash,
        is_valid: true,
        duplicate_attempt: validation.duplicateAttempt ?? false,
        ip_address: ip,
        user_agent: userAgent,
        error_message: linkError?.message ?? "Failed to generate sign-in link",
        metadata: { appId: validation.appId },
      });

      return new Response(
        JSON.stringify({ isValid: true, linked: true, error: "Failed to generate sign-in link" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    await supabaseAdmin.from("cyberlsi_auth_log").insert({
      user_id: profile.id,
      cyberlsi_user_id: validation.userId,
      auth_param_hash: authParamHash,
      is_valid: true,
      duplicate_attempt: validation.duplicateAttempt ?? false,
      ip_address: ip,
      user_agent: userAgent,
      metadata: { appId: validation.appId },
    });

    return new Response(
      JSON.stringify({
        isValid: true,
        linked: true,
        signInUrl: linkData.properties.action_link,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("CyberLSI validate error:", message);

    await supabaseAdmin.from("cyberlsi_auth_log").insert({
      auth_param_hash: authParamHash,
      is_valid: false,
      ip_address: ip,
      user_agent: userAgent,
      error_message: message,
    });

    return new Response(
      JSON.stringify({ error: "Validation failed", details: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
