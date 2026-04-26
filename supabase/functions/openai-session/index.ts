
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Create a Supabase client with the user's authorization header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    let knowledgeBaseInstructions = "";
    if (user) {
        // Fetch knowledge base files for the user
        const { data: files, error: filesError } = await supabaseClient
            .from('knowledge_base_files')
            .select('file_name');

        if (filesError) {
            console.error("Error fetching knowledge base files:", filesError);
        } else if (files && files.length > 0) {
            const fileNames = files.map(f => f.file_name).join(', ');
            knowledgeBaseInstructions = ` The user has uploaded the following documents for your reference, you should base your answers on them: ${fileNames}.`;
        }
    }

    const baseInstructions = "You are a helpful assistant integrated into a CRM application. Greet the user and ask how you can help. Be concise and helpful. You can help users navigate around the application by using the `navigateTo` tool, and you can make phone calls to customers using the `makeCall` tool.";

    const instructions = baseInstructions + knowledgeBaseInstructions;

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using the supported gpt-4o model
        voice: "alloy",
        instructions: instructions,
        tools: [
          {
            type: "function",
            name: "navigateTo",
            description: "Navigate to a specific page in the application. Available pages are: Dashboard, Conversations, Customers, Pipeline, Analytics, QuoteInvoice, and Employees.",
            parameters: {
              type: "object",
              properties: {
                page: {
                  type: "string",
                  description: "The page to navigate to.",
                  enum: ["Dashboard", "Conversations", "Customers", "Pipeline", "Analytics", "QuoteInvoice", "Employees"],
                },
              },
              required: ["page"],
            },
          },
          {
            type: "function",
            name: "makeCall",
            description: "Make an outbound phone call to a customer.",
            parameters: {
              type: "object",
              properties: {
                phoneNumber: {
                  type: "string",
                  description: "The phone number to call in E.164 format (e.g., +15551234567).",
                },
                customerId: {
                  type: "string",
                  description: "The ID of the customer to call. Use this to associate the call with a customer record.",
                },
              },
              required: ["phoneNumber"],
            },
          },
        ],
      }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", errorText);
        throw new Error(`Failed to create session: ${errorText}`);
    }
    const data = await response.json();
    console.log("Session created:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
