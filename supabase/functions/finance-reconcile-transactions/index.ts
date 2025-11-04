import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const { customerId, autoMatch = true } = body;

    console.log(`Reconciling transactions for customer: ${customerId}`);

    // Fetch all invoices
    const { data: invoices } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'sent', 'partial', 'overdue']);

    // Fetch all payments
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id);

    if (!invoices || !payments) {
      return new Response(JSON.stringify({ 
        message: 'No transactions to reconcile',
        matched: 0,
        unmatched: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const reconciliationResults = {
      matched: 0,
      unmatched: 0,
      auto_matched: 0,
      manual_review_needed: [],
      fully_paid: [],
      partially_paid: []
    };

    // Process each invoice
    for (const invoice of invoices) {
      // Get all payments for this invoice
      const invoicePayments = payments.filter(p => p.invoice_id === invoice.id);
      const totalPaid = invoicePayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const invoiceAmount = parseFloat(invoice.total_amount || 0);

      if (totalPaid >= invoiceAmount) {
        // Invoice is fully paid
        if (invoice.status !== 'paid') {
          await supabaseClient
            .from('invoices')
            .update({ 
              status: 'paid',
              paid_date: new Date().toISOString()
            })
            .eq('id', invoice.id)
            .eq('user_id', user.id);
          
          reconciliationResults.fully_paid.push(invoice.invoice_number);
        }
        reconciliationResults.matched++;
      } else if (totalPaid > 0) {
        // Invoice is partially paid
        if (invoice.status !== 'partial') {
          await supabaseClient
            .from('invoices')
            .update({ status: 'partial' })
            .eq('id', invoice.id)
            .eq('user_id', user.id);
          
          reconciliationResults.partially_paid.push({
            invoice_number: invoice.invoice_number,
            amount_due: invoiceAmount,
            amount_paid: totalPaid,
            remaining: invoiceAmount - totalPaid
          });
        }
        reconciliationResults.matched++;
      } else {
        reconciliationResults.unmatched++;
      }
    }

    // Auto-match unallocated payments if enabled
    if (autoMatch) {
      const unallocatedPayments = payments.filter(p => !p.invoice_id);
      
      for (const payment of unallocatedPayments) {
        const paymentAmount = parseFloat(payment.amount || 0);
        
        // Find matching invoice by amount
        const matchingInvoice = invoices.find(inv => {
          const unpaidAmount = parseFloat(inv.total_amount || 0) - 
            payments
              .filter(p => p.invoice_id === inv.id)
              .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
          
          return Math.abs(unpaidAmount - paymentAmount) < 0.01; // Allow 1 cent variance
        });

        if (matchingInvoice) {
          await supabaseClient
            .from('payments')
            .update({ invoice_id: matchingInvoice.id })
            .eq('id', payment.id)
            .eq('user_id', user.id);
          
          reconciliationResults.auto_matched++;
          console.log(`Auto-matched payment ${payment.payment_number} to invoice ${matchingInvoice.invoice_number}`);
        } else {
          reconciliationResults.manual_review_needed.push({
            payment_number: payment.payment_number,
            amount: paymentAmount,
            date: payment.payment_date
          });
        }
      }
    }

    // Mark overdue invoices
    await supabaseClient.rpc('mark_overdue_invoices');

    console.log('Transaction reconciliation complete:', reconciliationResults);

    return new Response(JSON.stringify({ 
      results: reconciliationResults,
      message: 'Transaction reconciliation completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error reconciling transactions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
