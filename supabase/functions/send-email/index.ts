import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Initialize Resend with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Set CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define the structure of an email request
interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  senderName: string;
  attachmentPaths?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the email data from the request body
    const { to, subject, message, senderName, attachmentPaths = [] }: EmailRequest = await req.json();

    if (!to || !subject || !message) {
      throw new Error("Missing required fields: to, subject, or message");
    }

    let attachments = [];
    
    // Process attachments if provided
    if (attachmentPaths.length > 0) {
      try {
        attachments = await Promise.all(attachmentPaths.map(async (path) => {
          // Get file from storage
          const { data, error } = await supabase.storage
            .from('customer-docs')
            .download(path);
            
          if (error) throw error;
          
          // Convert to base64 for Resend API
          const buffer = await data.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          
          const fileName = path.split('/').pop() || 'attachment';
          
          return {
            filename: fileName,
            content: base64,
          };
        }));
      } catch (error) {
        console.error("Error processing attachments:", error);
        // Continue sending email without attachments if there's an error
      }
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${senderName} <onboarding@resend.dev>`,
      to: [to],
      subject: subject,
      html: `${message}<hr style="border: 1px solid #eee; margin: 20px 0;" /><p style="color: #666; font-size: 12px;">This email was sent from your broker management system.</p>`,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
