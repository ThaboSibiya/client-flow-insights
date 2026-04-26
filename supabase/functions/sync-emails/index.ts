
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

    const { providerId, configId } = await req.json()

    console.log('Syncing emails for provider:', providerId)

    // Get the email configuration
    const { data: emailConfig, error: configError } = await supabaseClient
      .from('email_integrations')
      .select('*')
      .eq('id', configId)
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .single()

    if (configError || !emailConfig) {
      return new Response(
        JSON.stringify({ error: 'Email configuration not found or disabled' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update sync status to indicate sync is starting
    const { error: statusError } = await supabaseClient
      .from('email_sync_status')
      .upsert({
        provider_id: providerId,
        user_id: user.id,
        sync_status: 'syncing',
        last_sync_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider_id' })

    if (statusError) {
      console.error('Failed to update sync status:', statusError)
    }

    // Mock email sync for demonstration
    // In a real implementation, you would:
    // 1. Connect to the email provider's API using stored credentials
    // 2. Fetch new emails since last sync
    // 3. Parse and store emails in the database
    // 4. Update thread information
    // 5. Handle attachments and other metadata

    console.log('Email sync configuration:', {
      provider: emailConfig.provider_id,
      settings: emailConfig.settings
    })

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock storing some emails
    const mockEmails = [
      {
        provider_message_id: `mock-${Date.now()}-1`,
        provider_id: providerId,
        thread_id: `thread-${Date.now()}`,
        subject: 'Welcome to our service',
        from_email: 'support@example.com',
        from_name: 'Customer Support',
        to_emails: [user.email],
        cc_emails: [],
        bcc_emails: [],
        body_text: 'Thank you for signing up for our service. We are excited to have you!',
        body_html: '<p>Thank you for signing up for our service. We are excited to have you!</p>',
        is_read: false,
        is_sent: false,
        is_draft: false,
        message_date: new Date().toISOString(),
        labels: ['inbox']
      }
    ]

    // For each mock email, create thread and email records
    for (const emailData of mockEmails) {
      // Check if thread exists
      const { data: existingThread } = await supabaseClient
        .from('email_threads')
        .select('id')
        .eq('thread_id', emailData.thread_id)
        .eq('provider_id', providerId)
        .single()

      let threadId = existingThread?.id

      if (!existingThread) {
        // Create new thread
        const { data: newThread, error: threadError } = await supabaseClient
          .from('email_threads')
          .insert({
            user_id: user.id,
            thread_id: emailData.thread_id,
            subject: emailData.subject,
            participants: [emailData.from_email, ...emailData.to_emails],
            last_message_at: emailData.message_date,
            provider_id: providerId,
            labels: emailData.labels,
            message_count: 1,
            unread_count: emailData.is_read ? 0 : 1
          })
          .select('id')
          .single()

        if (threadError) {
          console.error('Failed to create thread:', threadError)
          continue
        }
        
        threadId = newThread?.id
      }

      // Store the email
      const { error: emailError } = await supabaseClient
        .from('emails')
        .insert({
          user_id: user.id,
          thread_id: threadId,
          provider_message_id: emailData.provider_message_id,
          provider_id: emailData.provider_id,
          subject: emailData.subject,
          from_email: emailData.from_email,
          from_name: emailData.from_name,
          to_emails: emailData.to_emails,
          cc_emails: emailData.cc_emails,
          bcc_emails: emailData.bcc_emails,
          body_text: emailData.body_text,
          body_html: emailData.body_html,
          is_read: emailData.is_read,
          is_sent: emailData.is_sent,
          is_draft: emailData.is_draft,
          message_date: emailData.message_date,
          labels: emailData.labels
        })

      if (emailError) {
        console.error('Failed to store email:', emailError)
      }
    }

    // Update sync status to completed
    const { error: completedStatusError } = await supabaseClient
      .from('email_sync_status')
      .upsert({
        provider_id: providerId,
        user_id: user.id,
        sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        total_emails_synced: mockEmails.length,
        error_message: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider_id' })

    if (completedStatusError) {
      console.error('Failed to update completion status:', completedStatusError)
    }

    console.log(`Email sync completed for provider ${providerId}. Synced ${mockEmails.length} emails.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sync completed for ${providerId}`,
        emailsSynced: mockEmails.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error syncing emails:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
