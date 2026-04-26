import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { customerId, amountTolerance = 0.01 } = await req.json();

    console.log('Starting auto-match for user:', user.id, 'customer:', customerId);

    // Get unmatched invoices
    const invoiceQuery = supabaseClient
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'sent', 'partial', 'overdue']);

    if (customerId) {
      invoiceQuery.eq('customer_id', customerId);
    }

    const { data: invoices, error: invError } = await invoiceQuery;

    if (invError) {
      console.error('Error fetching invoices:', invError);
      throw invError;
    }

    // Get unmatched payments
    const paymentQuery = supabaseClient
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .is('invoice_id', null);

    if (customerId) {
      paymentQuery.eq('customer_id', customerId);
    }

    const { data: payments, error: payError } = await paymentQuery;

    if (payError) {
      console.error('Error fetching payments:', payError);
      throw payError;
    }

    const matches = [];
    const matchedPaymentIds = new Set();

    // Auto-match based on amount
    for (const invoice of invoices || []) {
      for (const payment of payments || []) {
        if (matchedPaymentIds.has(payment.id)) continue;

        const invoiceAmount = Number(invoice.total_amount);
        const paymentAmount = Number(payment.amount);
        const difference = Math.abs(invoiceAmount - paymentAmount);

        // Match if amounts are within tolerance
        if (difference <= amountTolerance) {
          // Update payment with invoice_id
          const { error: updateError } = await supabaseClient
            .from('payments')
            .update({ invoice_id: invoice.id })
            .eq('id', payment.id);

          if (!updateError) {
            // Update invoice status
            await supabaseClient
              .from('invoices')
              .update({ status: 'paid', paid_date: payment.payment_date })
              .eq('id', invoice.id);

            matches.push({
              invoiceId: invoice.id,
              paymentId: payment.id,
              amount: paymentAmount,
            });

            matchedPaymentIds.add(payment.id);
            break; // Move to next invoice
          }
        }
      }
    }

    console.log(`Auto-matched ${matches.length} payments to invoices`);

    return new Response(JSON.stringify({ 
      success: true,
      matchesCreated: matches.length,
      matches,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-auto-match:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
