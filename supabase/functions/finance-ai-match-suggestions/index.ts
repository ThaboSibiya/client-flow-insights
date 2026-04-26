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

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  total_amount: number;
  due_date: string;
  status: string;
}

interface Payment {
  id: string;
  payment_number: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
}

interface MatchSuggestion {
  invoice_id: string;
  invoice_number: string;
  payment_id: string;
  payment_number: string;
  confidence: number;
  reason: string;
  invoice_amount: number;
  payment_amount: number;
}

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

    const body = await req.json();
    const { invoices, payments, customerMap } = body;

    console.log(`Generating AI match suggestions for ${invoices.length} invoices and ${payments.length} payments`);

    // Build context for AI
    const invoiceContext = invoices.map((inv: Invoice) => ({
      id: inv.id,
      number: inv.invoice_number,
      customer: customerMap[inv.customer_id] || 'Unknown',
      amount: inv.total_amount,
      due_date: inv.due_date,
    }));

    const paymentContext = payments.map((pay: Payment) => ({
      id: pay.id,
      number: pay.payment_number,
      customer: customerMap[pay.customer_id] || 'Unknown',
      amount: pay.amount,
      date: pay.payment_date,
      method: pay.payment_method,
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert financial reconciliation AI. Your task is to analyze invoices and payments to suggest the best matches.

Matching criteria:
1. Same customer (highest priority)
2. Exact or very close amount match
3. Payment date close to invoice due date
4. Consider partial payments (payment amount close to invoice amount)

Return suggestions as a JSON array with this structure:
{
  "suggestions": [
    {
      "invoice_id": "uuid",
      "payment_id": "uuid",
      "confidence": 95,
      "reason": "Exact amount match for same customer"
    }
  ]
}

Confidence scoring:
- 90-100%: Exact customer + exact amount match
- 80-89%: Same customer + amount within 1%
- 70-79%: Same customer + amount within 5%
- 60-69%: Same customer + amount within 10%
- Below 60%: Don't suggest

Only suggest matches with confidence >= 60%.`;

    const userPrompt = `Analyze these invoices and payments and suggest matches:

INVOICES:
${JSON.stringify(invoiceContext, null, 2)}

PAYMENTS:
${JSON.stringify(paymentContext, null, 2)}

Return only the top 5 most confident matches.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_matches',
              description: 'Return invoice-payment match suggestions with confidence scores',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        invoice_id: { type: 'string' },
                        payment_id: { type: 'string' },
                        confidence: { type: 'number' },
                        reason: { type: 'string' }
                      },
                      required: ['invoice_id', 'payment_id', 'confidence', 'reason'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['suggestions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_matches' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('AI Gateway error');
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData));

    let suggestions: any[] = [];
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      suggestions = parsed.suggestions || [];
    }

    // Enrich suggestions with invoice and payment details
    const enrichedSuggestions: MatchSuggestion[] = (suggestions
      .map((s: any) => {
        const invoice = invoices.find((i: Invoice) => i.id === s.invoice_id);
        const payment = payments.find((p: Payment) => p.id === s.payment_id);
        
        if (!invoice || !payment) return null;
        
        return {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          payment_id: payment.id,
          payment_number: payment.payment_number,
          confidence: Math.round(s.confidence),
          reason: s.reason,
          invoice_amount: invoice.total_amount,
          payment_amount: payment.amount,
        };
      })
      .filter((s: any) => s !== null)
      .slice(0, 5); // Top 5 suggestions

    console.log(`Generated ${enrichedSuggestions.length} match suggestions`);

    return new Response(JSON.stringify({ suggestions: enrichedSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error generating AI match suggestions:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
