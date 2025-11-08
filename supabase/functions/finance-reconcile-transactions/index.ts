import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReconcileRequest {
  customerId: string;
  autoMatch?: boolean;
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

    const { customerId, autoMatch = true }: ReconcileRequest = await req.json();
    console.log("Reconciling transactions for customer:", customerId);

    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", customerId)
      .in("status", ["pending", "sent", "partial"]);

    if (invoicesError) throw invoicesError;

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", customerId)
      .is("invoice_id", null);

    if (paymentsError) throw paymentsError;

    let matched = 0;
    let autoMatched = 0;
    const matchedPairs: any[] = [];

    if (autoMatch && payments && invoices) {
      for (const payment of payments) {
        const matchingInvoice = invoices.find(
          (inv) => Math.abs(inv.total_amount - payment.amount) < 0.01
        );

        if (matchingInvoice) {
          const { error: updateError } = await supabase
            .from("payments")
            .update({ invoice_id: matchingInvoice.id })
            .eq("id", payment.id);

          if (!updateError) {
            autoMatched++;
            matched++;
            matchedPairs.push({
              payment_id: payment.id,
              invoice_id: matchingInvoice.id,
              amount: payment.amount,
            });
          }
        }
      }
    }

    const result = {
      success: true,
      results: {
        matched,
        auto_matched: autoMatched,
        total_invoices: invoices?.length || 0,
        total_payments: payments?.length || 0,
        matched_pairs: matchedPairs,
      },
    };

    console.log("Reconciliation complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in reconcile-transactions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
