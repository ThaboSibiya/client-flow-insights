import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'csv';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const customerId = url.searchParams.get('customerId');

    console.log('Exporting reconciliation data:', { format, startDate, endDate, customerId });

    // Build query
    let query = supabaseClient
      .from('reconciliations')
      .select(`
        *,
        invoices (
          invoice_number,
          total_amount,
          due_date
        ),
        payments (
          payment_number,
          amount,
          payment_date,
          payment_method
        )
      `)
      .eq('created_by', user.id);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: reconciliations, error: recError } = await query.order('created_at', { ascending: false });

    if (recError) {
      console.error('Error fetching reconciliations:', recError);
      throw recError;
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Date',
        'Invoice Number',
        'Payment Number',
        'Invoice Amount',
        'Payment Amount',
        'Matched Amount',
        'Status',
        'Payment Method',
      ];

      const csvRows = reconciliations?.map(rec => [
        new Date(rec.created_at).toLocaleDateString(),
        rec.invoices?.invoice_number || '',
        rec.payments?.payment_number || '',
        rec.invoices?.total_amount || '',
        rec.payments?.amount || '',
        rec.matched_amount,
        rec.reconciliation_status,
        rec.payments?.payment_method || '',
      ]) || [];

      const csv = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(',')),
      ].join('\n');

      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="reconciliation-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'json') {
      return new Response(JSON.stringify(reconciliations, null, 2), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="reconciliation-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in reconciliation-export:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
