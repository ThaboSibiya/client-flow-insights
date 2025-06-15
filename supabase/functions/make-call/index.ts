
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { phoneNumber, customerId } = await req.json();

    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }
    
    console.log(`Received request to call ${phoneNumber}`);
    if (customerId) {
        console.log(`Associated with customer ID: ${customerId}`);
    }

    // This is where the integration with a service like Twilio or Telnyx would go.
    // For now, we are just simulating the call initiation.
    const message = `Simulated call to ${phoneNumber} initiated successfully.`;

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error making call:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

