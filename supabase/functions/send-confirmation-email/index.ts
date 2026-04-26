import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
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

interface ConfirmationEmailRequest {
  email: string;
  confirmationUrl: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email, confirmationUrl, userName }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Quikle CRM <noreply@quiklecrm.com>",
      to: [email],
      subject: "Confirm Your Quikle CRM Account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Your Account</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Quikle CRM</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${userName ? `Hi ${userName},` : 'Hello,'}
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up for Quikle CRM! Please confirm your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 30px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600;
                          display: inline-block;
                          font-size: 16px;">
                  Confirm Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #667eea; word-break: break-all;">
                ${confirmationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                If you didn't create an account with Quikle CRM, you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Best regards,<br>
                The Quikle CRM Team
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Quikle CRM. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Confirmation email sent successfully:", emailResponse.data?.id);

    // Log successful email send to security audit
    await supabase.from('security_events').insert({
      event_type: 'email_sent',
      resource_type: 'confirmation_email',
      metadata: {
        email,
        email_id: emailResponse.data?.id,
        status: 'success'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
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
    console.error("Error in send-confirmation-email function:", error);
    
    // Log failed email send
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from('security_events').insert({
        event_type: 'email_failed',
        resource_type: 'confirmation_email',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          status: 'failed'
        }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
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
