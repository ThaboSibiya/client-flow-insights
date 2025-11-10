import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  customerId: string;
  reminderType: 'payment_reminder' | 'overdue_payment' | 'account_flagged';
  customMessage?: string;
  invoiceIds?: string[];
}

const generateInvoicePDF = (invoice: any): string => {
  const items = invoice.quote_invoice_items || [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; font-size: 32px; margin-bottom: 5px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-details div { flex: 1; }
        .invoice-details h3 { color: #666; font-size: 14px; margin-bottom: 5px; }
        .invoice-details p { font-size: 14px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
        td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; margin-top: 20px; }
        .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <p style="font-size: 18px; color: #666;">Invoice #${invoice.number}</p>
      </div>
      
      <div class="invoice-details">
        <div>
          <h3>BILL TO</h3>
          <p><strong>${invoice.customer_name || 'N/A'}</strong></p>
          <p>${invoice.customer_email || ''}</p>
        </div>
        <div>
          <h3>INVOICE DETAILS</h3>
          <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
      </div>
      
      ${invoice.subject ? `<p style="margin-bottom: 20px;"><strong>Subject:</strong> ${invoice.subject}</p>` : ''}
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">$${item.rate.toFixed(2)}</td>
              <td class="text-right">$${(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div>
          <span>Subtotal:</span>
          <span>$${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${invoice.discount > 0 ? `
          <div>
            <span>Discount:</span>
            <span>-$${invoice.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${invoice.tax > 0 ? `
          <div>
            <span>Tax:</span>
            <span>$${invoice.tax.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total">
          <span>Total:</span>
          <span>$${invoice.total.toFixed(2)}</span>
        </div>
      </div>
      
      ${invoice.notes ? `
        <div style="margin-top: 30px;">
          <h3 style="color: #666; margin-bottom: 10px;">Notes</h3>
          <p style="line-height: 1.6;">${invoice.notes}</p>
        </div>
      ` : ''}
      
      ${invoice.terms ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #666; margin-bottom: 10px;">Terms & Conditions</h3>
          <p style="line-height: 1.6; font-size: 12px;">${invoice.terms}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting send-reminder-with-invoices function');
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { customerId, reminderType, customMessage, invoiceIds = [] }: ReminderRequest = await req.json();
    console.log('Request params:', { customerId, reminderType, invoiceCount: invoiceIds.length });

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

    console.log('Customer found:', customer.name);

    // Fetch invoices if IDs provided
    let invoices: any[] = [];
    if (invoiceIds.length > 0) {
      const { data: fetchedInvoices, error: invoicesError } = await supabaseClient
        .from('quote_invoices')
        .select('*, quote_invoice_items(*)')
        .in('id', invoiceIds)
        .eq('user_id', user.id);

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
      } else {
        invoices = fetchedInvoices || [];
        console.log('Fetched invoices:', invoices.length);
      }
    }

    // Generate email subject based on reminder type
    let subject = '';
    switch (reminderType) {
      case 'payment_reminder':
        subject = 'Payment Reminder';
        break;
      case 'overdue_payment':
        subject = 'Overdue Payment Notice';
        break;
      case 'account_flagged':
        subject = 'Account Review Required';
        break;
      default:
        subject = 'Account Notification';
    }

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            <p>Dear ${customer.name},</p>
            <p>${customMessage || 'This is an automated reminder regarding your account.'}</p>
            ${invoices.length > 0 ? `
              <p style="margin-top: 20px;"><strong>Attached Invoices:</strong></p>
              <ul>
                ${invoices.map(inv => `
                  <li>Invoice #${inv.number} - $${inv.total.toFixed(2)} (${inv.status})</li>
                `).join('')}
              </ul>
            ` : ''}
            <p style="margin-top: 20px;">If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate PDF attachments
    const attachments = invoices.map(invoice => ({
      filename: `Invoice_${invoice.number}.pdf`,
      content: Buffer.from(generateInvoicePDF(invoice)).toString('base64'),
      content_type: 'text/html'
    }));

    console.log('Sending email with', attachments.length, 'attachments');

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: 'Reminders <onboarding@resend.dev>',
      to: [customer.email],
      subject: subject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    console.log('Email sent successfully:', emailResult.id);

    // Log in email_history
    await supabaseClient
      .from('email_history')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        subject: subject,
        message: customMessage || 'Automated reminder',
        sender: 'system',
        status: 'sent',
        attachments: invoices.map(inv => `Invoice_${inv.number}.pdf`)
      });

    // Log in reminder_history if table exists
    try {
      await supabaseClient
        .from('reminder_history')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          reminder_type: reminderType,
          message: customMessage || 'Automated reminder',
          sent_at: new Date().toISOString()
        });
    } catch (err) {
      console.log('reminder_history table may not exist:', err);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        attachmentCount: attachments.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-reminder-with-invoices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
