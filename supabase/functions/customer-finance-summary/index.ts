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

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching finance summary for customer: ${customerId}`);

    // Fetch finance summary
    const { data: summary, error: summaryError } = await supabaseClient
      .from('customer_finance_summary')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (summaryError) {
      console.error('Error fetching finance summary:', summaryError);
      throw summaryError;
    }

    // Fetch recent invoices
    const { data: invoices, error: invoicesError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    // Fetch recent payments
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .order('payment_date', { ascending: false })
      .limit(5);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      throw paymentsError;
    }

    // Calculate totals
    const totalInvoiced = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;
    const totalPaid = payments?.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0) || 0;
    const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0;

    const response = {
      summary: summary || {
        current_balance: 0,
        total_owed: 0,
        credit_limit: 0,
        credit_terms: 'Net 30',
        risk_rating: 'low',
        account_status: 'active'
      },
      recent_invoices: invoices || [],
      recent_payments: payments || [],
      statistics: {
        total_invoiced: totalInvoiced,
        total_paid: totalPaid,
        overdue_count: overdueInvoices
      }
    };

    console.log('Finance summary fetched successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in customer-finance-summary:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
