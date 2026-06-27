// Public edge function: provisions (if needed) and signs in the shared demo user.
// Returns a Supabase session the client can call setSession() with.
import { createClient } from "npm:@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_EMAIL = "demo@quikle.co.za";
const DEMO_WORKSPACE_NAME = "Quikle Demo Workspace";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Find or create the demo user
    let demoUserId: string | null = null;
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users?.find((u) => u.email === DEMO_EMAIL);

    if (existing) {
      demoUserId = existing.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: DEMO_EMAIL,
        email_confirm: true,
        user_metadata: { full_name: "Demo User", is_demo: true },
      });
      if (createErr || !created.user) throw createErr ?? new Error("Failed to create demo user");
      demoUserId = created.user.id;
    }


    // 2. Mark profile as demo
    await admin
      .from("profiles")
      .update({ is_demo: true })
      .eq("id", demoUserId);

    // 3. Ensure a demo workspace exists for this user
    const { data: existingWs } = await admin
      .from("workspaces")
      .select("id")
      .eq("created_by", demoUserId)
      .eq("is_demo", true)
      .limit(1)
      .maybeSingle();

    let workspaceId = existingWs?.id as string | undefined;

    if (!workspaceId) {
      const { data: ws, error: wsErr } = await admin
        .from("workspaces")
        .insert({
          name: DEMO_WORKSPACE_NAME,
          slug: "demo-" + crypto.randomUUID().slice(0, 8),
          created_by: demoUserId,
          is_demo: true,
          industry: "General",
        })
        .select("id")
        .single();
      if (wsErr) throw wsErr;
      workspaceId = ws.id;

      // Upgrade subscription so trial banner / paywall doesn't appear
      await admin
        .from("workspace_subscriptions")
        .update({ plan_name: "Team", status: "active", trial_ends_at: null })
        .eq("workspace_id", workspaceId);
    }

    // 4. Seed (always — gives every prospect a fresh slate)
    await admin.rpc("seed_demo_workspace", { p_workspace_id: workspaceId });

    // 5. Sign in via password to get a session
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: sessionData, error: signInErr } = await userClient.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password,
    });
    if (signInErr || !sessionData.session) throw signInErr ?? new Error("Sign-in failed");

    return new Response(
      JSON.stringify({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("demo-signin error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
