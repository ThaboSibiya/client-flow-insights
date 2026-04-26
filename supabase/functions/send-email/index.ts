
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { 
      to_emails, 
      cc_emails, 
      bcc_emails, 
      subject, 
      body_html, 
      body_text, 
      thread_id 
    } = await req.json()

    console.log('Sending email:', { to_emails, subject, thread_id })

    // Here you would integrate with your email provider (Gmail API, Outlook API, etc.)
    // For now, we'll just store the sent email in the database
    
    // Get user's email configuration
    const { data: emailConfig, error: configError } = await supabaseClient
      .from('email_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .limit(1)
      .single()

    if (configError || !emailConfig) {
      return new Response(
        JSON.stringify({ error: 'No email configuration found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a new thread if not replying
    let emailThreadId = thread_id
    if (!thread_id) {
      const { data: newThread, error: threadError } = await supabaseClient
        .from('email_threads')
        .insert({
          user_id: user.id,
          thread_id: `sent-${Date.now()}`,
          subject: subject,
          participants: to_emails,
          last_message_at: new Date().toISOString(),
          provider_id: emailConfig.provider_id
        })
        .select('id')
        .single()

      if (threadError) {
        throw threadError
      }

      emailThreadId = newThread.id
    }

    // Store the sent email
    const { error: emailError } = await supabaseClient
      .from('emails')
      .insert({
        user_id: user.id,
        thread_id: emailThreadId,
        provider_message_id: `sent-${Date.now()}-${Math.random()}`,
        provider_id: emailConfig.provider_id,
        subject: subject,
        from_email: user.email,
        from_name: user.user_metadata?.full_name || user.email,
        to_emails: to_emails,
        cc_emails: cc_emails || [],
        bcc_emails: bcc_emails || [],
        body_text: body_text,
        body_html: body_html,
        is_read: true,
        is_sent: true,
        is_draft: false,
        message_date: new Date().toISOString()
      })

    if (emailError) {
      throw emailError
    }

    // Here you would actually send the email using the provider's API
    // For demo purposes, we'll just return success
    console.log('Email stored successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully (stored in database)' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
