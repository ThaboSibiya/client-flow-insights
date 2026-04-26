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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') ?? '';
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';

    // Check if user has free-only mode enabled
    let freeOnly = false;
    try {
      const { data: settingRow } = await supabaseClient
        .from('company_settings')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'ai_agent_free_only')
        .maybeSingle();
      const v = (settingRow?.value as { value?: unknown } | null)?.value;
      freeOnly = v === true || v === 'true';
    } catch (_) { /* default false */ }

    // Provider chain: Lovable AI Gateway (paid) → OpenRouter free models.
    // Free-only mode skips paid providers. Model identities never leave the server.
    type Provider = { url: string; key: string; model: string; free: boolean; isOpenRouter: boolean };
    const ALL_PROVIDERS: Provider[] = [
      { url: 'https://ai.gateway.lovable.dev/v1/chat/completions', key: LOVABLE_API_KEY, model: 'google/gemini-2.5-flash', free: false, isOpenRouter: false },
      { url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'deepseek/deepseek-chat-v3.1:free', free: true, isOpenRouter: true },
      { url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'meta-llama/llama-3.3-70b-instruct:free', free: true, isOpenRouter: true },
      { url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'google/gemini-2.0-flash-exp:free', free: true, isOpenRouter: true },
    ];
    const providers = (freeOnly ? ALL_PROVIDERS.filter(p => p.free) : ALL_PROVIDERS).filter(p => p.key);
    if (providers.length === 0) {
      throw new Error(freeOnly
        ? 'Free-only mode enabled but OPENROUTER_API_KEY is not configured.'
        : 'No AI provider keys configured (LOVABLE_API_KEY / OPENROUTER_API_KEY).');
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

    const requestBodyBase = {
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
    };

    let suggestions: any[] = [];
    let lastErr = '';
    let succeeded = false;
    let lastStatus = 0;

    for (const p of providers) {
      try {
        const aiResponse = await fetch(p.url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${p.key}`,
            'Content-Type': 'application/json',
            ...(p.isOpenRouter ? {
              'HTTP-Referer': 'https://quikle-innovation-suite.lovable.app',
              'X-Title': 'Quikle Finance AI',
            } : {}),
          },
          body: JSON.stringify({ model: p.model, ...requestBodyBase }),
        });

        if (!aiResponse.ok) {
          lastStatus = aiResponse.status;
          const errorText = await aiResponse.text();
          lastErr = `provider ${aiResponse.status}: ${errorText.slice(0, 200)}`;
          // Retry on transient/rate/credit errors with next provider
          if (aiResponse.status === 429 || aiResponse.status === 402 || aiResponse.status >= 500 || aiResponse.status === 408) {
            console.warn(`[finance-ai-match] provider failed (${aiResponse.status}) → fallback`);
            continue;
          }
          // Hard error — break and surface
          break;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const parsed = JSON.parse(toolCall.function.arguments);
          suggestions = parsed.suggestions || [];
        }
        succeeded = true;
        break;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn(`[finance-ai-match] provider exception: ${lastErr}`);
        continue;
      }
    }

    if (!succeeded) {
      if (lastStatus === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (lastStatus === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits or enable free-only mode.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('All AI providers failed:', lastErr);
      throw new Error('AI service unavailable');
    }


    // Enrich suggestions with invoice and payment details
    const enrichedSuggestions: MatchSuggestion[] = suggestions
      .map((s: any): MatchSuggestion | null => {
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
      .filter((s): s is MatchSuggestion => s !== null)
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
