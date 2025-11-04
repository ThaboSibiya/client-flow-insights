import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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
    const { customerId, startDate, endDate } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating statement for customer: ${customerId}`);

    // Fetch customer details
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', user.id)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // Fetch finance summary
    const { data: summary } = await supabaseClient
      .from('customer_finance_summary')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .maybeSingle();

    // Build query for transactions
    let invoicesQuery = supabaseClient
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    if (startDate) {
      invoicesQuery = invoicesQuery.gte('issue_date', startDate);
    }
    if (endDate) {
      invoicesQuery = invoicesQuery.lte('issue_date', endDate);
    }

    const { data: invoices } = await invoicesQuery.order('issue_date', { ascending: false });

    let paymentsQuery = supabaseClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    if (startDate) {
      paymentsQuery = paymentsQuery.gte('payment_date', startDate);
    }
    if (endDate) {
      paymentsQuery = paymentsQuery.lte('payment_date', endDate);
    }

    const { data: payments } = await paymentsQuery.order('payment_date', { ascending: false });

    // Generate HTML statement
    const htmlStatement = generateStatementHTML(customer, summary, invoices || [], payments || [], startDate, endDate);

    console.log('Statement generated successfully');

    // Return HTML for now (PDF generation would require additional library)
    return new Response(JSON.stringify({ 
      statement_html: htmlStatement,
      customer_name: customer.name,
      generated_at: new Date().toISOString(),
      message: 'Statement generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in customer-generate-statement:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateStatementHTML(customer: any, summary: any, invoices: any[], payments: any[], startDate?: string, endDate?: string): string {
  const today = new Date().toLocaleDateString();
  const periodText = startDate && endDate 
    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    : 'All Time';

  const totalInvoiced = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const totalPaid = payments.reduce((sum, pay) => sum + parseFloat(pay.amount || 0), 0);
  const balance = summary?.current_balance || (totalInvoiced - totalPaid);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #333; }
    .info { margin-bottom: 30px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f0f0f0; padding: 12px; text-align: left; border-bottom: 2px solid #333; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .summary { margin-top: 30px; padding: 20px; background: #f0f0f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Financial Statement</h1>
    <p>Generated: ${today}</p>
  </div>
  
  <div class="info">
    <div class="info-row"><strong>Customer:</strong> ${customer.name}</div>
    <div class="info-row"><strong>Email:</strong> ${customer.email}</div>
    <div class="info-row"><strong>Account Number:</strong> ${summary?.account_number || 'N/A'}</div>
    <div class="info-row"><strong>Period:</strong> ${periodText}</div>
  </div>

  <h2>Invoices</h2>
  <table>
    <thead>
      <tr>
        <th>Invoice #</th>
        <th>Date</th>
        <th>Due Date</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${invoices.map(inv => `
        <tr>
          <td>${inv.invoice_number}</td>
          <td>${new Date(inv.issue_date).toLocaleDateString()}</td>
          <td>${new Date(inv.due_date).toLocaleDateString()}</td>
          <td>$${parseFloat(inv.total_amount).toFixed(2)}</td>
          <td>${inv.status}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3">Total Invoiced</td>
        <td>$${totalInvoiced.toFixed(2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h2>Payments</h2>
  <table>
    <thead>
      <tr>
        <th>Payment #</th>
        <th>Date</th>
        <th>Method</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${payments.map(pay => `
        <tr>
          <td>${pay.payment_number}</td>
          <td>${new Date(pay.payment_date).toLocaleDateString()}</td>
          <td>${pay.payment_method || 'N/A'}</td>
          <td>$${parseFloat(pay.amount).toFixed(2)}</td>
          <td>${pay.status}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3">Total Paid</td>
        <td>$${totalPaid.toFixed(2)}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <div class="summary">
    <h2>Account Summary</h2>
    <div class="info-row"><strong>Total Invoiced:</strong> $${totalInvoiced.toFixed(2)}</div>
    <div class="info-row"><strong>Total Paid:</strong> $${totalPaid.toFixed(2)}</div>
    <div class="info-row"><strong>Current Balance:</strong> $${balance.toFixed(2)}</div>
    <div class="info-row"><strong>Credit Terms:</strong> ${summary?.credit_terms || 'Net 30'}</div>
    <div class="info-row"><strong>Account Status:</strong> ${summary?.account_status || 'Active'}</div>
  </div>
</body>
</html>
  `;
}
