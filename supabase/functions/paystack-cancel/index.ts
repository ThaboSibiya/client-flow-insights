import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const allowedOriginExact = new Set([
  'https://quikle-innovation-suite.lovable.app',
  'https://crm.quikle.co.za',
  'https://quikle.co.za',
  'https://www.quikle.co.za',
  'http://localhost:5173',
  'http://localhost:3000',
]);
const allowedOriginPatterns = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = !!origin && (
    allowedOriginExact.has(origin) ||
    allowedOriginPatterns.some((re) => re.test(origin))
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : 'https://crm.quikle.co.za',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const { workspace_id } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: 'workspace_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the workspace's active subscription
    const { data: subscription, error: subError } = await supabase
      .from('workspace_subscriptions')
      .select('*')
      .eq('workspace_id', workspace_id)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle();

    if (subError || !subscription) {
      return new Response(JSON.stringify({ error: 'No active subscription found for this workspace' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (subscription.paystack_subscription_code) {
      const disableRes = await fetch('https://api.paystack.co/subscription/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: subscription.paystack_subscription_code,
          token: subscription.paystack_email_token || subscription.paystack_authorization_code,
        }),
      });

      const disableData = await disableRes.json();
      console.log('Paystack disable response:', disableData);

      if (!disableRes.ok && disableRes.status !== 404) {
        console.error('Paystack disable failed:', disableData);
      }
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: updateError } = await adminClient
      .from('workspace_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspace_id);

    if (updateError) {
      console.error('Error updating workspace subscription:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to cancel subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await adminClient.from('subscription_events').insert({
      user_id: userId,
      event_type: 'subscription_cancelled',
      metadata: {
        workspace_id,
        plan_name: subscription.plan_name,
        cancelled_by: 'user',
        had_paystack_subscription: !!subscription.paystack_subscription_code,
      },
    });

    console.log(`Subscription cancelled for workspace ${workspace_id}, plan: ${subscription.plan_name}`);

    return new Response(JSON.stringify({
      cancelled: true,
      message: 'Subscription cancelled successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in paystack-cancel:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
