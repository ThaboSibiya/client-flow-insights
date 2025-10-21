import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailDeliveryStats {
  total_sent: number;
  total_failed: number;
  recent_failures: any[];
  pending_confirmations: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email delivery statistics
    const { data: sentEmails, error: sentError } = await supabase
      .from('security_events')
      .select('*')
      .eq('event_type', 'email_sent')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: failedEmails, error: failedError } = await supabase
      .from('security_events')
      .select('*')
      .eq('event_type', 'email_failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: registrations, error: regError } = await supabase
      .from('security_events')
      .select('*')
      .eq('event_type', 'registration_success')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (sentError || failedError || regError) {
      throw new Error("Failed to fetch email statistics");
    }

    const stats: EmailDeliveryStats = {
      total_sent: sentEmails?.length || 0,
      total_failed: failedEmails?.length || 0,
      recent_failures: failedEmails?.slice(0, 10) || [],
      pending_confirmations: registrations?.length || 0,
    };

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error monitoring email delivery:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
