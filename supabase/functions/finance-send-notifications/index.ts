import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  customerId: string;
  notificationType: "payment_reminder" | "overdue_payment" | "account_flagged" | "payment_received";
  customMessage?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { customerId, notificationType, customMessage }: NotificationRequest = await req.json();
    console.log("Sending notification:", { customerId, notificationType });

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError) throw customerError;

    const { data: financeSummary } = await supabase
      .from("customer_finance_summary")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    let subject = "";
    let message = customMessage || "";

    switch (notificationType) {
      case "payment_reminder":
        subject = "Payment Reminder";
        if (!message) {
          message = `Dear ${customer.name}, this is a friendly reminder about your outstanding balance of R${financeSummary?.current_balance || 0}.`;
        }
        break;
      case "overdue_payment":
        subject = "Overdue Payment Notice";
        if (!message) {
          message = `Dear ${customer.name}, your payment is now overdue. Please submit payment immediately to avoid late fees.`;
        }
        break;
      case "account_flagged":
        subject = "Account Review Required";
        if (!message) {
          message = `Dear ${customer.name}, your account has been flagged for review. Please contact us to discuss your account status.`;
        }
        break;
      case "payment_received":
        subject = "Payment Received - Thank You";
        if (!message) {
          message = `Dear ${customer.name}, we have received your payment. Thank you for your business!`;
        }
        break;
    }

    console.log("Notification prepared:", { to: customer.email, subject, message });

    const result = {
      success: true,
      notification: {
        customer_id: customerId,
        type: notificationType,
        sent_at: new Date().toISOString(),
        recipient: customer.email,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
