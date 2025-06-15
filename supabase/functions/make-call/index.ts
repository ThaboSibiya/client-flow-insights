
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Twilio from 'https://esm.sh/twilio';

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

    // Get Twilio credentials from Supabase secrets
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials are not set in Supabase secrets.");
    }

    const twilioClient = new Twilio(accountSid, authToken);

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
        throw new Error('Could not fetch AI agent phone number.');
    }
    
    const fromPhoneNumber = settingData?.value?.value;

    if (!fromPhoneNumber) {
        throw new Error("AI Agent phone number is not configured in settings. Please set it up in Quote/Invoice -> Settings -> AI Agent Settings.");
    }
    
    console.log(`Initiating call to ${phoneNumber} from ${fromPhoneNumber} via Twilio.`);
    if (customerId) {
        console.log(`Associated with customer ID: ${customerId}`);
    }

    // Make the call using Twilio.
    // When answered, it will play a message. Connecting to the live agent is a future step.
    const call = await twilioClient.calls.create({
      twiml: `<Response><Say>Hello. You have a call from your AI assistant. This functionality is being connected. Goodbye.</Say></Response>`,
      to: phoneNumber,
      from: fromPhoneNumber,
    });
    
    console.log('Twilio call initiated:', call.sid);

    const message = `Call to ${phoneNumber} from ${fromPhoneNumber} initiated successfully via Twilio. SID: ${call.sid}`;

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
