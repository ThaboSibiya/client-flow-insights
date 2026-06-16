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

    const user = { id: userData.user.id };
    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Reference is required' }), {
        status: 400,
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

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${paystackSecretKey}` },
    });

    const verifyData = await verifyRes.json();

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      console.error('Paystack verification failed:', verifyData);

      // Update workspace subscription status to failed
      await adminClient.from('workspace_subscriptions').update({
        status: 'cancelled',
      }).eq('paystack_reference', reference);

      await adminClient.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'payment_verification_failed',
        paystack_reference: reference,
        metadata: {
          paystack_status: verifyData.data?.status,
          gateway_response: verifyData.data?.gateway_response,
        },
      });

      return new Response(JSON.stringify({
        verified: false,
        message: verifyData.data?.gateway_response || 'Payment verification failed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paystackTx = verifyData.data;
    const planName = paystackTx.metadata?.plan_name || 'Solo';
    const workspaceId = paystackTx.metadata?.workspace_id;

    // Check if already active (idempotency)
    const { data: existingSub } = await adminClient
      .from('workspace_subscriptions')
      .select('status')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (existingSub?.status === 'active') {
      console.log(`Payment already verified for ref: ${reference}`);
      return new Response(JSON.stringify({
        verified: true,
        plan_name: planName,
        workspace_id: workspaceId,
        status: 'active',
        already_processed: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: updateError } = await adminClient.from('workspace_subscriptions').update({
      status: 'active',
      plan_name: planName,
      paystack_customer_code: paystackTx.customer?.customer_code || null,
      paystack_authorization_code: paystackTx.authorization?.authorization_code || null,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('paystack_reference', reference);

    if (updateError) {
      console.error('Error updating workspace subscription:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to activate subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await adminClient.from('subscription_events').insert({
      user_id: user.id,
      event_type: 'payment_verified',
      paystack_reference: reference,
      metadata: {
        plan_name: planName,
        workspace_id: workspaceId,
        amount: paystackTx.amount / 100,
        currency: paystackTx.currency,
        customer_code: paystackTx.customer?.customer_code,
        authorization_code: paystackTx.authorization?.authorization_code,
        transaction_id: paystackTx.id,
      },
    });

    console.log(`Payment verified for workspace ${workspaceId}, ref: ${reference}, plan: ${planName}`);

    return new Response(JSON.stringify({
      verified: true,
      plan_name: planName,
      workspace_id: workspaceId,
      status: 'active',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in paystack-verify:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
