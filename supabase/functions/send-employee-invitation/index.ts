
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

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

interface InvitationRequest {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { employeeId, email, firstName, lastName, companyName }: InvitationRequest = await req.json();

    // Get the current employee (who is sending the invitation)
    const { data: currentEmployee, error: currentEmpError } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (currentEmpError || !currentEmployee) {
      throw new Error("Current user is not an employee");
    }

    // Create the invitation token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "create_employee_invitation",
      {
        p_employee_id: employeeId,
        p_email: email,
        p_created_by: currentEmployee.id,
      }
    );

    if (tokenError) {
      throw new Error(`Failed to create invitation: ${tokenError.message}`);
    }

    const invitationToken = tokenData;
    const invitationUrl = `${req.headers.get("origin")}/employee-setup?token=${invitationToken}`;

    // Send invitation email
    const emailResult = await resend.emails.send({
      from: "Quikle CRM <noreply@quiklecrm.com>",
      to: [email],
      subject: `You've been invited to join ${companyName} on Quikle CRM`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to Quikle CRM!</h1>
          <p>Hi ${firstName} ${lastName},</p>
          <p>You've been invited to join <strong>${companyName}</strong> on Quikle CRM as a team member.</p>
          <p>To complete your registration and set up your account, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Registration
            </a>
          </div>
          <p><strong>Important:</strong> This invitation will expire in 7 days.</p>
          <p>If you have any questions, please contact your system administrator.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${invitationUrl}">${invitationUrl}</a>
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
        invitationToken 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
