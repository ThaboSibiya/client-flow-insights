import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoiceId, paymentId, matchedAmount } = await req.json();

    if (!invoiceId || !paymentId || !matchedAmount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating manual reconciliation:', { invoiceId, paymentId, matchedAmount });

    // Get invoice and payment details
    const { data: invoice, error: invError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invError || !invoice) {
      throw new Error('Invoice not found or unauthorized');
    }

    const { data: payment, error: payError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (payError || !payment) {
      throw new Error('Payment not found or unauthorized');
    }

    // Determine reconciliation status
    const invoiceAmount = Number(invoice.total_amount);
    const amount = Number(matchedAmount);
    let status = 'unmatched';
    
    if (amount >= invoiceAmount) {
      status = 'matched';
    } else if (amount > 0 && amount < invoiceAmount) {
      status = 'partial';
    }

    // Update payment with invoice_id
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({ invoice_id: invoiceId })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    // The auto_create_reconciliation trigger will create the reconciliation record

    // Update invoice status
    if (status === 'matched') {
      await supabaseClient
        .from('invoices')
        .update({ status: 'paid', paid_date: payment.payment_date })
        .eq('id', invoiceId);
    } else if (status === 'partial') {
      await supabaseClient
        .from('invoices')
        .update({ status: 'partial' })
        .eq('id', invoiceId);
    }

    console.log('Reconciliation created successfully');

    return new Response(JSON.stringify({ 
      success: true,
      reconciliationStatus: status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-match:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
