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

interface ReconcileRequest {
  customerId: string;
  autoMatch?: boolean;
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

    const { customerId, autoMatch = true }: ReconcileRequest = await req.json();
    console.log("Reconciling transactions for customer:", customerId);

    // Get pending invoices
    const { data: invoices, error: invError } = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", customerId)
      .in("status", ["pending", "sent", "partial"]);

    if (invError) {
      throw invError;
    }

    // Get unassigned payments
    const { data: payments, error: payError } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", customerId)
      .is("invoice_id", null);

    if (payError) {
      throw payError;
    }

    let matchedCount = 0;
    let autoMatchedCount = 0;

    if (autoMatch && invoices && payments) {
      // Auto-match by amount
      for (const payment of payments) {
        const matchingInvoice = invoices.find(
          (inv) => Math.abs(parseFloat(inv.total_amount) - parseFloat(payment.amount)) < 0.01
        );

        if (matchingInvoice) {
          await supabase
            .from("payments")
            .update({ invoice_id: matchingInvoice.id })
            .eq("id", payment.id);

          autoMatchedCount++;
          matchedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matchedCount,
        autoMatchedCount,
        unmatchedInvoices: (invoices?.length || 0) - matchedCount,
        unmatchedPayments: (payments?.length || 0) - matchedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in finance-reconcile-transactions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
