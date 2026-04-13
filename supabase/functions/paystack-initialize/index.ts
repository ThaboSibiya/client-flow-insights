import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string };
    const { plan_name, amount, currency, callback_url, workspace_id } = await req.json();

    if (!plan_name || !amount || !workspace_id) {
      return new Response(JSON.stringify({ error: 'Plan name, amount, and workspace_id required' }), {
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

    const amountInSmallestUnit = Math.round(amount * 100);
    const reference = `ws_${workspace_id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInSmallestUnit,
        currency: currency === 'ZAR' ? 'ZAR' : 'USD',
        reference,
        callback_url: callback_url || '',
        metadata: {
          user_id: user.id,
          workspace_id,
          plan_name,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: plan_name },
            { display_name: 'Workspace', variable_name: 'workspace_id', value: workspace_id },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error('Paystack error:', paystackData);
      return new Response(JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store pending workspace subscription
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await adminClient.from('workspace_subscriptions').upsert({
      workspace_id,
      user_id: user.id,
      plan_name,
      plan_amount: amount,
      currency: currency === 'ZAR' ? 'ZAR' : 'USD',
      status: 'pending',
      paystack_reference: reference,
      trial_ends_at: null, // Clear trial when upgrading
    }, { onConflict: 'workspace_id' });

    // Log event
    await adminClient.from('subscription_events').insert({
      user_id: user.id,
      event_type: 'payment_initialized',
      paystack_reference: reference,
      metadata: { plan_name, amount, currency, workspace_id },
    });

    console.log(`Payment initialized for workspace ${workspace_id}, user ${user.id}, plan: ${plan_name}, ref: ${reference}`);

    return new Response(JSON.stringify({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in paystack-initialize:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
