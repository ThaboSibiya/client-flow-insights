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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

Deno.serve(async (req) => {
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const filter = url.searchParams.get('filter');

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching transactions for customer: ${customerId}, filter: ${filter || 'none'}`);

    // Fetch invoices
    let invoicesQuery = supabaseClient
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    if (filter === 'overdue') {
      invoicesQuery = invoicesQuery.eq('status', 'overdue');
    }

    const { data: invoices, error: invoicesError } = await invoicesQuery.order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      throw paymentsError;
    }

    // Fetch customer transactions (from the original transaction ledger)
    const { data: transactions, error: transactionsError } = await supabaseClient
      .from('customer_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching customer transactions:', transactionsError);
      throw transactionsError;
    }

    const response = {
      invoices: invoices || [],
      payments: payments || [],
      transactions: transactions || [],
      summary: {
        total_invoices: invoices?.length || 0,
        total_payments: payments?.length || 0,
        overdue_invoices: invoices?.filter(inv => inv.status === 'overdue').length || 0,
        total_invoiced: invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0,
        total_paid: payments?.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0) || 0
      }
    };

    console.log(`Fetched ${response.invoices.length} invoices, ${response.payments.length} payments`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in customer-transactions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
