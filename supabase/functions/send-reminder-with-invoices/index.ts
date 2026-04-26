import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
          <h3>Invoice Date</h3>
          <p>${new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <h3>Due Date</h3>
          <p>${invoice.valid_until ? new Date(invoice.valid_until).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <h3>Status</h3>
          <p style="text-transform: capitalize; font-weight: 600;">${invoice.status}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>${item.description || 'N/A'}</td>
              <td class="text-right">${item.quantity || 0}</td>
              <td class="text-right">R${parseFloat(item.unit_price || 0).toFixed(2)}</td>
              <td class="text-right">R${(parseFloat(item.unit_price || 0) * (item.quantity || 0)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div>
          <span>Subtotal:</span>
          <span>R${parseFloat(invoice.subtotal || invoice.total || 0).toFixed(2)}</span>
        </div>
        ${invoice.tax_amount ? `
        <div>
          <span>Tax:</span>
          <span>R${parseFloat(invoice.tax_amount).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total">
          <span>Total:</span>
          <span>R${parseFloat(invoice.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { customerId, reminderType, customMessage, invoiceIds }: ReminderRequest = await req.json();

    console.log("Processing reminder for customer:", customerId);

    // Get customer details
    const { data: customer, error: customerError } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .eq("user_id", user.id)
      .single();

    if (customerError || !customer) {
      return new Response(
        JSON.stringify({ error: "Customer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invoices to attach (either specified ones or all unpaid)
    let invoicesToAttach: any[] = [];
    if (invoiceIds && invoiceIds.length > 0) {
      const { data: invoices } = await supabaseClient
        .from("quotes_invoices")
        .select("*, quote_invoice_items(*)")
        .in("id", invoiceIds)
        .eq("customer_id", customerId)
        .eq("user_id", user.id);
      
      invoicesToAttach = invoices || [];
    } else {
      // Get all unpaid invoices
      const { data: invoices } = await supabaseClient
        .from("quotes_invoices")
        .select("*, quote_invoice_items(*)")
        .eq("customer_id", customerId)
        .eq("user_id", user.id)
        .in("status", ["pending", "sent", "overdue"]);
      
      invoicesToAttach = invoices || [];
    }

    // Generate subject and message based on reminder type
    let subject = "";
    let message = customMessage || "";

    switch (reminderType) {
      case "payment_reminder":
        subject = "Payment Reminder - Outstanding Invoice(s)";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nThis is a friendly reminder about your outstanding invoice(s). Please find the details attached.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards`;
        }
        break;
      case "overdue_payment":
        subject = "URGENT: Overdue Payment Notice";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nWe notice that your payment is overdue. Please review the attached invoice(s) and arrange payment at your earliest convenience.\n\nIf you have already made the payment, please disregard this notice.\n\nBest regards`;
        }
        break;
      case "account_flagged":
        subject = "Important: Account Review Required";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nYour account has been flagged for review due to outstanding payments. Please contact us to discuss your account status.\n\nWe value your business and would like to work with you to resolve any issues.\n\nBest regards`;
        }
        break;
    }

    // Generate invoice PDFs
    const attachments = invoicesToAttach.map((invoice) => {
      const htmlContent = generateInvoicePDF(invoice);
      const htmlBuffer = new TextEncoder().encode(htmlContent);
      const base64Html = btoa(String.fromCharCode(...htmlBuffer));

      return {
        filename: `invoice-${invoice.number}.html`,
        content: base64Html,
        type: 'text/html',
      };
    });

    // Send email via Resend
    const emailData = {
      from: "noreply@yourdomain.com", // Configure this with your verified domain
      to: customer.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <div style="white-space: pre-line; margin: 20px 0;">
            ${message}
          </div>
          ${invoicesToAttach.length > 0 ? `
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <h3 style="margin-top: 0;">Attached Invoices:</h3>
            <ul>
              ${invoicesToAttach.map(inv => `
                <li>Invoice #${inv.number} - R${parseFloat(inv.total || 0).toFixed(2)} (${inv.status})</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
      `,
      attachments: attachments,
    };

    const emailResult = await resend.emails.send(emailData);

    // Log the reminder in reminder_history
    await supabaseClient.from("reminder_history").insert({
      user_id: user.id,
      customer_id: customerId,
      reminder_type: reminderType,
      message: message,
      sent_at: new Date().toISOString(),
      sent_by: user.email,
      status: "sent",
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.data?.id,
        invoicesAttached: invoicesToAttach.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending reminder:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
