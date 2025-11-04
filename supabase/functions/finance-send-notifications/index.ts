import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
    const { customerId, notificationType, customMessage } = body;

    if (!customerId || !notificationType) {
      return new Response(JSON.stringify({ 
        error: 'Customer ID and notification type are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Sending ${notificationType} notification for customer: ${customerId}`);

    // Fetch customer details
    const { data: customer } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', user.id)
      .single();

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Fetch finance summary
    const { data: summary } = await supabaseClient
      .from('customer_finance_summary')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .maybeSingle();

    let emailSubject = '';
    let emailHtml = '';
    let invoicesData: any[] = [];

    switch (notificationType) {
      case 'overdue_payment':
        // Fetch overdue invoices
        const { data: overdueInvoices } = await supabaseClient
          .from('invoices')
          .select('*')
          .eq('customer_id', customerId)
          .eq('user_id', user.id)
          .eq('status', 'overdue');

        invoicesData = overdueInvoices || [];
        const totalOverdue = invoicesData.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

        emailSubject = `⚠️ Overdue Payment Reminder - ${customer.name}`;
        emailHtml = `
          <h2>Overdue Payment Notice</h2>
          <p>Dear ${customer.name},</p>
          <p>This is a friendly reminder that you have <strong>${invoicesData.length}</strong> overdue invoice(s) totaling <strong>$${totalOverdue.toFixed(2)}</strong>.</p>
          <h3>Overdue Invoices:</h3>
          <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
            <tr style="background: #f0f0f0;">
              <th>Invoice #</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
            </tr>
            ${invoicesData.map(inv => {
              const daysOverdue = Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
              return `
                <tr>
                  <td>${inv.invoice_number}</td>
                  <td>$${parseFloat(inv.total_amount).toFixed(2)}</td>
                  <td>${new Date(inv.due_date).toLocaleDateString()}</td>
                  <td>${daysOverdue} days</td>
                </tr>
              `;
            }).join('')}
          </table>
          <p style="margin-top: 20px;">Please arrange payment at your earliest convenience.</p>
          <p>If you have any questions, please contact us.</p>
          <p>Best regards,<br>Finance Team</p>
        `;
        break;

      case 'payment_reminder':
        // Fetch upcoming due invoices (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const { data: upcomingInvoices } = await supabaseClient
          .from('invoices')
          .select('*')
          .eq('customer_id', customerId)
          .eq('user_id', user.id)
          .in('status', ['pending', 'sent'])
          .lte('due_date', sevenDaysFromNow.toISOString());

        invoicesData = upcomingInvoices || [];
        const totalDue = invoicesData.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

        emailSubject = `💰 Payment Reminder - ${customer.name}`;
        emailHtml = `
          <h2>Upcoming Payment Reminder</h2>
          <p>Dear ${customer.name},</p>
          <p>This is a friendly reminder that you have <strong>${invoicesData.length}</strong> invoice(s) due soon, totaling <strong>$${totalDue.toFixed(2)}</strong>.</p>
          <h3>Upcoming Payments:</h3>
          <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
            <tr style="background: #f0f0f0;">
              <th>Invoice #</th>
              <th>Amount</th>
              <th>Due Date</th>
            </tr>
            ${invoicesData.map(inv => `
              <tr>
                <td>${inv.invoice_number}</td>
                <td>$${parseFloat(inv.total_amount).toFixed(2)}</td>
                <td>${new Date(inv.due_date).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top: 20px;">Thank you for your prompt attention to this matter.</p>
          <p>Best regards,<br>Finance Team</p>
        `;
        break;

      case 'account_flagged':
        emailSubject = `🚩 Account Review Required - ${customer.name}`;
        emailHtml = `
          <h2>Account Flagged for Review</h2>
          <p>Dear ${customer.name},</p>
          <p>Your account has been flagged for review. Please contact us at your earliest convenience to discuss your account status.</p>
          ${customMessage ? `<p><strong>Note:</strong> ${customMessage}</p>` : ''}
          <p><strong>Current Balance:</strong> $${summary?.current_balance?.toFixed(2) || '0.00'}</p>
          <p><strong>Risk Rating:</strong> ${summary?.risk_rating || 'Unknown'}</p>
          <p>Please contact our finance team to resolve any outstanding issues.</p>
          <p>Best regards,<br>Finance Team</p>
        `;
        break;

      case 'payment_received':
        emailSubject = `✅ Payment Received - ${customer.name}`;
        emailHtml = `
          <h2>Payment Confirmation</h2>
          <p>Dear ${customer.name},</p>
          <p>Thank you! We have received your payment.</p>
          ${customMessage ? `<p>${customMessage}</p>` : ''}
          <p><strong>Current Balance:</strong> $${summary?.current_balance?.toFixed(2) || '0.00'}</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>Finance Team</p>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Finance Team <onboarding@resend.dev>',
      to: [customer.email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log notification in finance notes
    await supabaseClient
      .from('finance_notes')
      .insert({
        customer_id: customerId,
        user_id: user.id,
        note: `${notificationType} notification sent to ${customer.email}`,
        tag: 'reminder',
        created_by: 'System'
      });

    return new Response(JSON.stringify({ 
      message: 'Notification sent successfully',
      email_id: emailResponse.id,
      type: notificationType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
