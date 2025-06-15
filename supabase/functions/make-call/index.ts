
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: settingData, error: settingError } = await supabaseClient
        .from('company_settings')
        .select('value')
        .eq('key', 'ai_agent_phone_number')
        .single();

    if (settingError && settingError.code !== 'PGRST116') {
        console.error('Error fetching agent phone number:', settingError);
    }
    
    // The value from DB is nested { value: "the_number" }
    const fromPhoneNumber = settingData?.value?.value;

    if (!fromPhoneNumber) {
        console.warn("AI Agent phone number is not configured in settings. The call will be simulated without a 'from' number.");
    }
    
    console.log(`Received request to call ${phoneNumber} from ${fromPhoneNumber || 'not-configured'}`);
    if (customerId) {
        console.log(`Associated with customer ID: ${customerId}`);
    }

    // This is where the integration with a service like Twilio or Telnyx would go.
    // You would use `fromPhoneNumber` as the `From` parameter.
    const message = `Simulated call to ${phoneNumber} from ${fromPhoneNumber || 'your configured number'} initiated successfully.`;

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
