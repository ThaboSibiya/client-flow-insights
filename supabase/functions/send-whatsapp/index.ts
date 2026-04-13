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

interface WhatsAppMessageRequest {
  phoneNumber: string;
  message: string;
  conversationId?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error('Twilio credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Twilio credentials not configured. Please add them in Settings → Integrations.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!TWILIO_WHATSAPP_NUMBER) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Twilio WhatsApp number not configured. Please add TWILIO_WHATSAPP_NUMBER in Settings → Integrations.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phoneNumber, message, conversationId }: WhatsAppMessageRequest = await req.json();

    if (!phoneNumber || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure phone number is in correct format for WhatsApp
    const formattedPhone = phoneNumber.startsWith('whatsapp:') 
      ? phoneNumber 
      : `whatsapp:${phoneNumber.replace(/[^+\d]/g, '')}`;

    const fromNumber = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
      ? TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

    console.log(`Sending WhatsApp message to: ${formattedPhone}`);

    // Send message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', formattedPhone);
    formData.append('Body', message);

    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioResult.message || 'Failed to send WhatsApp message' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('WhatsApp message sent successfully:', twilioResult.sid);

    // If conversationId provided, log the message to the conversation
    if (conversationId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_type: 'employee',
        sender_name: 'System',
        content: message,
        message_type: 'text',
        metadata: { 
          twilio_sid: twilioResult.sid,
          phone_number: phoneNumber 
        }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageSid: twilioResult.sid 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
