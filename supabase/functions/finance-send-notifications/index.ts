import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

interface NotificationRequest {
  customerId: string;
  notificationType: "payment_reminder" | "overdue_payment" | "account_flagged" | "payment_received";
  customMessage?: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
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

    console.log("Sending notification:", notificationType, "to customer:", customerId);

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError) {
      throw new Error(`Failed to fetch customer: ${customerError.message}`);
    }

    // Get finance summary
    const { data: financeSummary } = await supabase
      .from("customer_finance_summary")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    // Prepare notification content
    let subject = "";
    let message = customMessage || "";

    switch (notificationType) {
      case "payment_reminder":
        subject = "Payment Reminder";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nThis is a friendly reminder about your outstanding balance of R${financeSummary?.current_balance || 0}.\n\nPlease arrange payment at your earliest convenience.\n\nBest regards`;
        }
        break;
      case "overdue_payment":
        subject = "Overdue Payment Notice";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nYour account has an overdue balance of R${financeSummary?.current_balance || 0}.\n\nImmediate payment is required to avoid service disruption.\n\nBest regards`;
        }
        break;
      case "account_flagged":
        subject = "Account Review Required";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nYour account has been flagged for review. Please contact us to discuss your account status.\n\nBest regards`;
        }
        break;
      case "payment_received":
        subject = "Payment Received - Thank You";
        if (!customMessage) {
          message = `Dear ${customer.name},\n\nThank you for your payment. Your current balance is R${financeSummary?.current_balance || 0}.\n\nBest regards`;
        }
        break;
    }

    console.log("Notification prepared:", { subject, message });

    // In a production environment, you would send the actual email here
    // For now, we'll just log the notification

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: { subject, message, recipient: customer.email } 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in finance-send-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
