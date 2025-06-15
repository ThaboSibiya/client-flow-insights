
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        voice: "alloy",
        instructions: "You are a helpful assistant integrated into a CRM application. Greet the user and ask how you can help. Be concise and helpful. You can also help users navigate around the application by using the `navigateTo` tool.",
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
        ],
      }),
    });
    const data = await response.json();
    console.log("Session created:", data);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
