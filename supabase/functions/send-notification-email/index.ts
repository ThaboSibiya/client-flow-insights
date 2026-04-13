
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

interface NotificationEmailRequest {
  recipientId: string;
  senderName: string;
  content: string;
  conversationId: string;
  type: 'new_message' | 'mention' | 'assignment';
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { recipientId, senderName, content, conversationId, type }: NotificationEmailRequest = await req.json();

    // Get recipient's email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', recipientId)
      .single();

    if (profileError || !profile?.email) {
      console.error('Error fetching recipient profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has email notifications enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications, notification_frequency')
      .eq('user_id', recipientId)
      .single();

    if (!preferences?.email_notifications || preferences.notification_frequency === 'never') {
      return new Response(
        JSON.stringify({ message: 'Email notifications disabled for user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientName = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User';
    const subject = getEmailSubject(type, senderName);
    const emailContent = getEmailContent(recipientName, senderName, content, conversationId);

    const emailResponse = await resend.emails.send({
      from: 'Quikle <notifications@quikle.com>',
      to: [profile.email],
      subject,
      html: emailContent,
    });

    console.log('Notification email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify(emailResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending notification email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getEmailSubject(type: string, senderName: string): string {
  switch (type) {
    case 'new_message':
      return `New message from ${senderName}`;
    case 'mention':
      return `You were mentioned by ${senderName}`;
    case 'assignment':
      return `New conversation assigned by ${senderName}`;
    default:
      return `New notification from ${senderName}`;
  }
}

function getEmailContent(recipientName: string, senderName: string, content: string, conversationId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Message Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin: 0 0 10px 0;">New Message Received</h2>
        <p style="margin: 0; color: #6b7280;">You have a new message in your Quikle conversations.</p>
      </div>
      
      <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">From: ${senderName}</h3>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; line-height: 1.5;">${content.substring(0, 200)}${content.length > 200 ? '...' : ''}</p>
        </div>
      </div>
      
      <div style="text-center; margin: 30px 0;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/conversations" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          View Conversation
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>This email was sent from Quikle. If you don't want to receive these notifications, you can update your preferences in the app.</p>
      </div>
    </body>
    </html>
  `;
}
