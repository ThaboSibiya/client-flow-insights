import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@2.0.0';

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

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { customerId, startDate, endDate, recipientEmail } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Sending statement email for customer: ${customerId}`);

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

    const customerEmail = recipientEmail || customer.email;
    if (!customerEmail) {
      throw new Error('No email address available for customer');
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

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Statements <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Account Statement - ${customer.name}`,
      html: htmlStatement,
    });

    console.log('Statement email sent:', emailResult);

    // Log email in email_history
    await supabaseClient
      .from('email_history')
      .insert({
        customer_id: customerId,
        user_id: user.id,
        sender: user.email || 'system',
        subject: `Account Statement - ${customer.name}`,
        message: 'Financial statement email',
        status: 'sent',
        attachments: []
      });

    return new Response(JSON.stringify({ 
      success: true,
      email_id: emailResult.id,
      recipient: customerEmail,
      customer_name: customer.name,
      message: 'Statement emailed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in customer-email-statement:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
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
    body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #1e293b; font-size: 28px; }
    .header p { margin: 5px 0 0 0; color: #64748b; }
    .info { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; }
    .info-row strong { color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 600; color: #334155; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569; }
    .total-row { font-weight: bold; background: #fef3c7; border-top: 2px solid #fbbf24; }
    .summary { margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
    .summary h2 { margin: 0 0 20px 0; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .summary-row:last-child { border-bottom: none; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Financial Statement</h1>
      <p>Generated: ${today}</p>
    </div>
    
    <div class="info">
      <div class="info-row"><strong>Customer:</strong> <span>${customer.name}</span></div>
      <div class="info-row"><strong>Email:</strong> <span>${customer.email}</span></div>
      <div class="info-row"><strong>Account Number:</strong> <span>${summary?.account_number || 'N/A'}</span></div>
      <div class="info-row"><strong>Period:</strong> <span>${periodText}</span></div>
    </div>

    <h2 style="color: #1e293b; margin-top: 30px;">Invoices</h2>
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
        ${invoices.length > 0 ? invoices.map(inv => `
          <tr>
            <td>${inv.invoice_number}</td>
            <td>${new Date(inv.issue_date).toLocaleDateString()}</td>
            <td>${new Date(inv.due_date).toLocaleDateString()}</td>
            <td>$${parseFloat(inv.total_amount).toFixed(2)}</td>
            <td><span style="padding: 4px 8px; border-radius: 4px; background: ${getStatusColor(inv.status)}; color: white; font-size: 12px;">${inv.status}</span></td>
          </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No invoices found</td></tr>'}
        ${invoices.length > 0 ? `
          <tr class="total-row">
            <td colspan="3">Total Invoiced</td>
            <td>$${totalInvoiced.toFixed(2)}</td>
            <td></td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    <h2 style="color: #1e293b; margin-top: 30px;">Payments</h2>
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
        ${payments.length > 0 ? payments.map(pay => `
          <tr>
            <td>${pay.payment_number}</td>
            <td>${new Date(pay.payment_date).toLocaleDateString()}</td>
            <td>${pay.payment_method || 'N/A'}</td>
            <td>$${parseFloat(pay.amount).toFixed(2)}</td>
            <td><span style="padding: 4px 8px; border-radius: 4px; background: ${getStatusColor(pay.status)}; color: white; font-size: 12px;">${pay.status}</span></td>
          </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No payments found</td></tr>'}
        ${payments.length > 0 ? `
          <tr class="total-row">
            <td colspan="3">Total Paid</td>
            <td>$${totalPaid.toFixed(2)}</td>
            <td></td>
          </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="summary">
      <h2>Account Summary</h2>
      <div class="summary-row"><strong>Total Invoiced:</strong> <span>$${totalInvoiced.toFixed(2)}</span></div>
      <div class="summary-row"><strong>Total Paid:</strong> <span>$${totalPaid.toFixed(2)}</span></div>
      <div class="summary-row"><strong>Current Balance:</strong> <span>$${balance.toFixed(2)}</span></div>
      <div class="summary-row"><strong>Credit Terms:</strong> <span>${summary?.credit_terms || 'Net 30'}</span></div>
      <div class="summary-row"><strong>Account Status:</strong> <span>${summary?.account_status || 'Active'}</span></div>
    </div>

    <div class="footer">
      <p>This is an automated statement. Please contact us if you have any questions.</p>
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'paid': '#10b981',
    'completed': '#10b981',
    'pending': '#f59e0b',
    'sent': '#3b82f6',
    'overdue': '#ef4444',
    'partial': '#8b5cf6',
    'draft': '#6b7280'
  };
  return colors[status.toLowerCase()] || '#6b7280';
}
