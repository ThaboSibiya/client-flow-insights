import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Running scheduled check for overdue invoices...');

    // Mark overdue invoices
    await supabaseClient.rpc('mark_overdue_invoices');

    // Find all customers with overdue invoices
    const { data: overdueInvoices } = await supabaseClient
      .from('invoices')
      .select('customer_id, user_id, COUNT(*) as count, SUM(total_amount) as total')
      .eq('status', 'overdue')
      .group('customer_id, user_id');

    if (!overdueInvoices || overdueInvoices.length === 0) {
      console.log('No overdue invoices found');
      return new Response(JSON.stringify({ 
        message: 'No overdue invoices found',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const results = {
      processed: 0,
      notifications_sent: 0,
      errors: []
    };

    // Process each customer with overdue invoices
    for (const record of overdueInvoices) {
      try {
        results.processed++;

        // Fetch customer details
        const { data: customer } = await supabaseClient
          .from('customers')
          .select('*')
          .eq('id', record.customer_id)
          .single();

        if (!customer) continue;

        // Check if we already sent a notification recently (within 3 days)
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { data: recentNotes } = await supabaseClient
          .from('finance_notes')
          .select('created_at')
          .eq('customer_id', record.customer_id)
          .eq('tag', 'reminder')
          .gte('created_at', threeDaysAgo.toISOString())
          .limit(1);

        if (recentNotes && recentNotes.length > 0) {
          console.log(`Skipping customer ${customer.name} - notification sent recently`);
          continue;
        }

        // Create account flag for high-risk customers
        const { data: summary } = await supabaseClient
          .from('customer_finance_summary')
          .select('risk_rating')
          .eq('customer_id', record.customer_id)
          .maybeSingle();

        if (summary?.risk_rating === 'high' || summary?.risk_rating === 'critical') {
          await supabaseClient
            .from('account_flags')
            .insert({
              customer_id: record.customer_id,
              user_id: record.user_id,
              flag_type: 'payment_issue',
              flag_reason: `Multiple overdue invoices detected - ${record.count} invoice(s) totaling $${record.total}`,
              status: 'active',
              priority: 'high',
              flagged_by: 'System - Automated Check'
            });
        }

        // Log in finance notes
        await supabaseClient
          .from('finance_notes')
          .insert({
            customer_id: record.customer_id,
            user_id: record.user_id,
            note: `Automatic overdue check: ${record.count} invoice(s) overdue, total $${record.total}. Notification queued.`,
            tag: 'reminder',
            created_by: 'System'
          });

        results.notifications_sent++;
        console.log(`Processed overdue check for customer: ${customer.name}`);

      } catch (error) {
        console.error(`Error processing customer ${record.customer_id}:`, error);
        results.errors.push({ customer_id: record.customer_id, error: error.message });
      }
    }

    console.log('Overdue check complete:', results);

    return new Response(JSON.stringify({ 
      message: 'Overdue check completed',
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in overdue check cron:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
