// CyberLSI MFA push-result callback
// Receives the result of a push approval request from CyberLSI and updates
// the corresponding `cyberlsi_mfa_challenges` row, identified by the
// `challenge_ref` we stored when sending the push.
//
// Security model:
//   - JWT verification is disabled (CyberLSI calls this server-to-server with
//     no Supabase JWT). We instead require a shared secret in the
//     `x-cyberlsi-callback-secret` header that matches the
//     CYBERLSI_CALLBACK_SECRET env var. This secret is given to CyberLSI when
//     registering the callback URL.
//   - Updates are scoped strictly by `challenge_ref` and never trust caller-
//     supplied user_id values; the row's existing user_id is preserved.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cyberlsi-callback-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Body-size cap to defend against abuse via the (non-JWT-protected) endpoint.
const MAX_CALLBACK_BODY_BYTES = 32 * 1024; // 32 KB

// Constant-time string comparison to prevent timing attacks on the shared secret.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Per CyberLSI docs: result values
//   "Full success" | "Partial success" | "No success" | "Error"
// Map them to our internal status enum.
function mapResultToStatus(
  value: string | undefined | null,
  isSuccess: boolean | undefined,
): "approved" | "denied" | "error" {
  const v = (value ?? "").toLowerCase();
  if (isSuccess === true || v === "full success") return "approved";
  if (v === "no success" || v === "denied" || v === "rejected") return "denied";
  if (v === "partial success") return "approved"; // treat partial as approved; details kept in payload
  return "error";
}

interface CallbackBody {
  // Reference returned to us when we POSTed the push request
  challengeRef?: string;
  challenge_ref?: string;
  // CyberLSI standard result envelope
  value?: string;
  isSuccess?: boolean;
  message?: string;
  // Anything else (PIN/NFC details, signed payload, etc.) — kept verbatim
  [key: string]: unknown;
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

  // --- 1. Shared-secret auth ---
  const expectedSecret = Deno.env.get("CYBERLSI_CALLBACK_SECRET");
  if (!expectedSecret) {
    console.error("CYBERLSI_CALLBACK_SECRET is not configured");
    return new Response(
      JSON.stringify({ error: "Callback not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const providedSecret = req.headers.get("x-cyberlsi-callback-secret") ?? "";
  if (!safeEqual(providedSecret, expectedSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- 2. Body size guard + parse + validate body ---
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CALLBACK_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (raw.length > MAX_CALLBACK_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: CallbackBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const challengeRef = body.challengeRef ?? body.challenge_ref;
  if (!challengeRef || typeof challengeRef !== "string" || challengeRef.length > 256) {
    return new Response(
      JSON.stringify({ error: "challengeRef is required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // --- 3. Locate challenge row strictly by challenge_ref ---
  const { data: challenge, error: lookupError } = await supabaseAdmin
    .from("cyberlsi_mfa_challenges")
    .select("id, user_id, status, expires_at")
    .eq("challenge_ref", challengeRef)
    .maybeSingle();

  if (lookupError) {
    console.error("Challenge lookup error:", lookupError);
    return new Response(
      JSON.stringify({ error: "Lookup failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!challenge) {
    return new Response(
      JSON.stringify({ error: "Unknown challengeRef" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Already-resolved or expired challenges should not be re-written
  if (challenge.status !== "pending") {
    return new Response(
      JSON.stringify({
        ok: true,
        ignored: true,
        reason: `Challenge already in '${challenge.status}' state`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const expired = new Date(challenge.expires_at).getTime() < Date.now();
  if (expired) {
    await supabaseAdmin
      .from("cyberlsi_mfa_challenges")
      .update({
        status: "expired",
        resolved_at: new Date().toISOString(),
        response_payload: body as unknown as Record<string, unknown>,
      })
      .eq("id", challenge.id);

    return new Response(
      JSON.stringify({ ok: true, status: "expired" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // --- 4. Apply the result ---
  const newStatus = mapResultToStatus(body.value, body.isSuccess);

  const { error: updateError } = await supabaseAdmin
    .from("cyberlsi_mfa_challenges")
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
      response_payload: body as unknown as Record<string, unknown>,
      error_message: newStatus === "error"
        ? (body.message ?? "Unknown error from CyberLSI")
        : null,
    })
    .eq("id", challenge.id)
    // Defensive: only update if still pending (avoids race with polling/expiry)
    .eq("status", "pending");

  if (updateError) {
    console.error("Challenge update error:", updateError);
    return new Response(
      JSON.stringify({ error: "Update failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, status: newStatus }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
