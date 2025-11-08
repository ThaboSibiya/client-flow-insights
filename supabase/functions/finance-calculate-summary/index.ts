import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalculateRequest {
  customerId: string;
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

    const { customerId }: CalculateRequest = await req.json();
    console.log("Calculating summary for customer:", customerId);

    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", customerId);

    if (invoicesError) throw invoicesError;

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "completed");

    if (paymentsError) throw paymentsError;

    const totalInvoiced = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
    const totalPaid = payments?.reduce((sum, pay) => sum + Number(pay.amount), 0) || 0;
    const currentBalance = totalInvoiced - totalPaid;

    const overdueInvoices = invoices?.filter((inv) => inv.status === "overdue") || [];

    let riskRating = "low";
    if (overdueInvoices.length > 3 || currentBalance > 50000) {
      riskRating = "high";
    } else if (overdueInvoices.length > 0 || currentBalance > 10000) {
      riskRating = "medium";
    }

    const lastPayment = payments && payments.length > 0
      ? payments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]
      : null;

    const pendingInvoices = invoices?.filter(
      (inv) => inv.status === "pending" || inv.status === "sent"
    ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) || [];

    const nextDueDate = pendingInvoices.length > 0 ? pendingInvoices[0].due_date : null;

    const summaryData = {
      customer_id: customerId,
      current_balance: currentBalance,
      total_owed: totalInvoiced,
      risk_rating: riskRating,
      last_payment_date: lastPayment?.payment_date,
      last_payment_amount: lastPayment?.amount,
      next_due_date: nextDueDate,
      updated_at: new Date().toISOString(),
    };

    const { data: existingSummary } = await supabase
      .from("customer_finance_summary")
      .select("id")
      .eq("customer_id", customerId)
      .single();

    if (existingSummary) {
      await supabase
        .from("customer_finance_summary")
        .update(summaryData)
        .eq("customer_id", customerId);
    } else {
      await supabase
        .from("customer_finance_summary")
        .insert(summaryData);
    }

    const result = {
      success: true,
      summary: {
        ...summaryData,
        total_invoices: invoices?.length || 0,
        total_payments: payments?.length || 0,
        overdue_count: overdueInvoices.length,
      },
    };

    console.log("Summary calculated:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in calculate-summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
