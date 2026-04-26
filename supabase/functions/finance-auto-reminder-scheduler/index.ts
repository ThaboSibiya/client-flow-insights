import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

interface Invoice {
  id: string;
  customer_id: string;
  user_id: string;
  invoice_number: string;
  total_amount: number;
  due_date: string;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting automated reminder scheduler...');

    // Get current date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch all overdue invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .in('status', ['sent', 'overdue', 'partial'])
      .lt('due_date', now.toISOString());

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      throw invoicesError;
    }

    console.log(`Found ${invoices?.length || 0} overdue invoices`);

    const results = {
      processed: 0,
      reminders_sent: 0,
      errors: [] as string[],
      by_stage: {
        first_reminder: 0,
        second_reminder: 0,
        final_notice: 0,
      }
    };

    if (!invoices || invoices.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No overdue invoices found',
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each invoice
    for (const invoice of invoices as Invoice[]) {
      try {
        results.processed++;

        // Calculate days overdue
        const dueDate = new Date(invoice.due_date);
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`Invoice ${invoice.invoice_number}: ${daysDiff} days overdue`);

        // Determine reminder stage based on days overdue
        let reminderType: string | null = null;
        let stageKey: 'first_reminder' | 'second_reminder' | 'final_notice' | null = null;

        if (daysDiff >= 7 && daysDiff < 14) {
          reminderType = 'payment_reminder';
          stageKey = 'first_reminder';
        } else if (daysDiff >= 14 && daysDiff < 30) {
          reminderType = 'overdue_payment';
          stageKey = 'second_reminder';
        } else if (daysDiff >= 30) {
          reminderType = 'final_notice';
          stageKey = 'final_notice';
        }

        if (!reminderType) {
          console.log(`Invoice ${invoice.invoice_number} not at reminder threshold yet`);
          continue;
        }

        // Check if reminder already sent for this stage
        const { data: existingReminders } = await supabase
          .from('reminder_history')
          .select('*')
          .eq('customer_id', invoice.customer_id)
          .eq('reminder_type', reminderType)
          .gte('sent_at', new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        if (existingReminders && existingReminders.length > 0) {
          console.log(`Reminder already sent for ${invoice.invoice_number} at ${reminderType} stage`);
          continue;
        }

        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invoice.customer_id)
          .single();

        if (customerError || !customer) {
          console.error(`Customer not found for invoice ${invoice.invoice_number}`);
          results.errors.push(`Customer not found for invoice ${invoice.invoice_number}`);
          continue;
        }

        // Get all overdue invoices for this customer
        const { data: customerInvoices } = await supabase
          .from('invoices')
          .select('id')
          .eq('customer_id', invoice.customer_id)
          .in('status', ['sent', 'overdue', 'partial'])
          .lt('due_date', now.toISOString());

        const invoiceIds = customerInvoices?.map(inv => inv.id) || [invoice.id];

        // Send reminder email
        console.log(`Sending ${reminderType} reminder to ${customer.name}`);

        const { error: sendError } = await supabase.functions.invoke('send-reminder-with-invoices', {
          body: {
            customerId: invoice.customer_id,
            reminderType,
            invoiceIds,
            customMessage: getDefaultMessage(reminderType, customer.name, daysDiff),
          },
        });

        if (sendError) {
          console.error(`Failed to send reminder to ${customer.name}:`, sendError);
          results.errors.push(`Failed to send to ${customer.name}: ${sendError.message}`);
          continue;
        }

        results.reminders_sent++;
        if (stageKey) {
          results.by_stage[stageKey]++;
        }

        console.log(`✓ Sent ${reminderType} reminder to ${customer.name}`);

      } catch (error) {
        console.error(`Error processing invoice ${invoice.invoice_number}:`, error);
        results.errors.push(`Error processing ${invoice.invoice_number}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('Automated reminder scheduler completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Automated reminder scheduler completed',
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in automated reminder scheduler:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDefaultMessage(reminderType: string, customerName: string, daysOverdue: number): string {
  const templates = {
    payment_reminder: `Dear ${customerName},

This is a friendly reminder that you have outstanding invoices that are now ${daysOverdue} days overdue.

We kindly request that you review the attached invoices and arrange payment at your earliest convenience.

If you have any questions or concerns regarding these invoices, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.

Best regards,
Accounts Team`,

    overdue_payment: `Dear ${customerName},

We notice that payment for your invoices is now ${daysOverdue} days overdue. Despite our previous reminder, payment has not yet been received.

IMMEDIATE PAYMENT IS REQUIRED to avoid any service disruptions or additional charges.

Please review the attached invoices and arrange payment today. If you're experiencing difficulties, please contact us to discuss payment options.

We value your business and look forward to resolving this matter promptly.

Best regards,
Accounts Team`,

    final_notice: `Dear ${customerName},

FINAL NOTICE - This is a final warning regarding your overdue account, which is now ${daysOverdue} days past due.

Despite multiple reminders, payment has not been received. If payment is not received within 7 days, we will be forced to take the following actions:

• Suspension of services
• Referral to a collections agency
• Potential legal action
• Negative impact on your credit rating

This is your last opportunity to settle this account and avoid these serious consequences.

Please contact us IMMEDIATELY to arrange payment or discuss this matter.

Urgent Action Required,
Accounts Team`
  };

  return templates[reminderType as keyof typeof templates] || templates.payment_reminder;
}
