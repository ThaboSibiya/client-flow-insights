import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Calculating account summary for customer: ${customerId}`);

    // Fetch all invoices
    const { data: invoices } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    // Fetch all payments
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    // Calculate totals
    const totalInvoiced = invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;
    const totalPaid = payments?.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0) || 0;
    const outstandingBalance = totalInvoiced - totalPaid;

    // Find last payment
    const sortedPayments = payments?.sort((a, b) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
    const lastPayment = sortedPayments?.[0];

    // Count overdue invoices
    const overdueInvoices = invoices?.filter(inv => 
      inv.status === 'overdue' || 
      (inv.status !== 'paid' && new Date(inv.due_date) < new Date())
    ) || [];

    // Calculate total owed (unpaid invoices only)
    const totalOwed = invoices
      ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0) || 0;

    // Find next due date
    const upcomingInvoices = invoices
      ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const nextDueDate = upcomingInvoices?.[0]?.due_date || null;

    // Determine risk rating based on overdue and balance
    let riskRating = 'low';
    if (overdueInvoices.length > 3 || outstandingBalance > 10000) {
      riskRating = 'critical';
    } else if (overdueInvoices.length > 1 || outstandingBalance > 5000) {
      riskRating = 'high';
    } else if (overdueInvoices.length > 0 || outstandingBalance > 2000) {
      riskRating = 'medium';
    }

    const summary = {
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      outstanding_balance: outstandingBalance,
      total_owed: totalOwed,
      last_payment_date: lastPayment?.payment_date || null,
      last_payment_amount: lastPayment?.amount || 0,
      next_due_date: nextDueDate,
      overdue_count: overdueInvoices.length,
      overdue_amount: overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0),
      risk_rating: riskRating,
      invoice_count: invoices?.length || 0,
      payment_count: payments?.length || 0
    };

    // Update customer_finance_summary table
    const { data: existingSummary } = await supabaseClient
      .from('customer_finance_summary')
      .select('id')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSummary) {
      await supabaseClient
        .from('customer_finance_summary')
        .update({
          current_balance: outstandingBalance,
          total_owed: totalOwed,
          last_payment_date: summary.last_payment_date,
          last_payment_amount: summary.last_payment_amount,
          next_due_date: summary.next_due_date,
          risk_rating: riskRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSummary.id)
        .eq('user_id', user.id);
    } else {
      await supabaseClient
        .from('customer_finance_summary')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          account_number: `ACC-${Date.now()}`,
          current_balance: outstandingBalance,
          total_owed: totalOwed,
          last_payment_date: summary.last_payment_date,
          last_payment_amount: summary.last_payment_amount,
          next_due_date: summary.next_due_date,
          risk_rating: riskRating
        });
    }

    console.log('Account summary calculated and saved');

    return new Response(JSON.stringify({ 
      summary,
      message: 'Account summary calculated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error calculating account summary:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
