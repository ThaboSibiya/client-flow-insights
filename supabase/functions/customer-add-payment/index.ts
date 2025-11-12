import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const allowedOrigins = [
  'https://e1036b92-283a-4a65-9473-d759ed300ea1.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { customerId, amount, payment_method, invoice_id, reference_number, notes } = body;

    if (!customerId || !amount || !payment_method) {
      return new Response(JSON.stringify({ 
        error: 'Customer ID, amount, and payment method are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Adding payment for customer: ${customerId}, amount: ${amount}`);

    // Generate payment number
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Insert payment
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        customer_id: customerId,
        user_id: user.id,
        invoice_id: invoice_id || null,
        payment_number: paymentNumber,
        amount: parseFloat(amount),
        payment_method,
        reference_number: reference_number || null,
        status: 'completed',
        notes: notes || null,
        payment_date: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error adding payment:', paymentError);
      throw paymentError;
    }

    // Update finance summary
    const { data: summary, error: summaryError } = await supabaseClient
      .from('customer_finance_summary')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!summaryError && summary) {
      const newBalance = parseFloat(summary.current_balance || 0) - parseFloat(amount);
      await supabaseClient
        .from('customer_finance_summary')
        .update({
          current_balance: newBalance,
          last_payment_amount: parseFloat(amount),
          last_payment_date: new Date().toISOString()
        })
        .eq('id', summary.id)
        .eq('user_id', user.id);
    }

    // If payment is linked to invoice, the trigger will auto-update invoice status
    console.log('Payment added successfully:', paymentNumber);

    return new Response(JSON.stringify({ 
      payment,
      message: 'Payment recorded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error('Error in customer-add-payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
