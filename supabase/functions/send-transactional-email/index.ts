import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  senderName?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { to, subject, message, senderName = "Support Team" }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !subject || !message) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, message: !!message });
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!to.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending transactional email to:", to, "subject:", subject);

    const { data, error } = await resend.emails.send({
      from: `${senderName} <onboarding@resend.dev>`,
      to: [to],
      subject: subject,
      html: message,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", data?.id);

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
