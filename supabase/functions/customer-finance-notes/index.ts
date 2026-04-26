import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET - Retrieve finance notes
    if (req.method === 'GET') {
      console.log(`Fetching finance notes for customer: ${customerId}`);

      const { data: notes, error } = await supabaseClient
        .from('finance_notes')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching finance notes:', error);
        throw error;
      }

      console.log(`Found ${notes?.length || 0} finance notes`);

      return new Response(JSON.stringify({ notes: notes || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST - Add new finance note
    if (req.method === 'POST') {
      const body = await req.json();
      const { note, tag, created_by } = body;

      if (!note || !created_by) {
        return new Response(JSON.stringify({ error: 'Note and created_by are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Adding finance note for customer: ${customerId}`);

      const { data: newNote, error } = await supabaseClient
        .from('finance_notes')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          note,
          tag: tag || null,
          created_by
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding finance note:', error);
        throw error;
      }

      console.log('Finance note added successfully');

      return new Response(JSON.stringify({ note: newNote }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in customer-finance-notes:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
