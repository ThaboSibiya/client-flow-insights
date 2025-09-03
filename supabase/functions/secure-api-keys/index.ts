import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, provider, apiKey, domain } = await req.json()

    switch (action) {
      case 'set_key':
        return await setApiKey(provider, apiKey, domain, user.id)
      
      case 'test_connection':
        return await testConnection(provider, user.id)
      
      case 'get_status':
        return await getKeyStatus(provider, user.id)
      
      case 'rotate_key':
        return await rotateKey(provider, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error in secure-api-keys function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function setApiKey(provider: string, apiKey: string, domain: string | null, userId: string) {
  try {
    // Validate the API key format based on provider
    if (!validateApiKeyFormat(provider, apiKey)) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store the API key securely
    const secretName = `${provider.toUpperCase()}_API_KEY_${userId}`
    
    // In a real implementation, you would store this in Supabase Vault or a secure key management service
    // For now, we'll use environment variables (this would need to be handled differently in production)
    
    // Test the API key before storing
    const isValid = await testApiKey(provider, apiKey, domain)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'API key validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store configuration in database (without the actual key)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseClient
      .from('email_integrations')
      .upsert({
        user_id: userId,
        provider_id: provider,
        is_enabled: true,
        settings: {
          domain: domain,
          configured_at: new Date().toISOString(),
          last_validated: new Date().toISOString()
        }
      })

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'API key configured successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error setting API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to configure API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function testConnection(provider: string, userId: string) {
  try {
    // Retrieve the stored API key and test it
    const apiKey = await getStoredApiKey(provider, userId)
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No API key configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isValid = await testApiKey(provider, apiKey, null)
    
    return new Response(
      JSON.stringify({ valid: isValid, tested_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error testing connection:', error)
    return new Response(
      JSON.stringify({ error: 'Connection test failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getKeyStatus(provider: string, userId: string) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseClient
      .from('email_integrations')
      .select('is_enabled, settings')
      .eq('user_id', userId)
      .eq('provider_id', provider)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const hasKey = await getStoredApiKey(provider, userId) !== null
    
    return new Response(
      JSON.stringify({ 
        configured: hasKey,
        enabled: data?.is_enabled || false,
        settings: data?.settings || {}
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting key status:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function rotateKey(provider: string, userId: string) {
  // Implementation for key rotation would go here
  return new Response(
    JSON.stringify({ message: 'Key rotation not implemented yet' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  switch (provider) {
    case 'mailgun':
      return apiKey.startsWith('key-') && apiKey.length > 20
    case 'sendgrid':
      return apiKey.startsWith('SG.') && apiKey.length > 50
    case 'resend':
      return apiKey.startsWith('re_') && apiKey.length > 20
    case 'postmark':
      return apiKey.length === 36 // UUID format
    default:
      return apiKey.length > 10
  }
}

async function testApiKey(provider: string, apiKey: string, domain: string | null): Promise<boolean> {
  try {
    switch (provider) {
      case 'mailgun':
        return await testMailgunKey(apiKey, domain)
      case 'sendgrid':
        return await testSendGridKey(apiKey)
      case 'resend':
        return await testResendKey(apiKey)
      case 'postmark':
        return await testPostmarkKey(apiKey)
      default:
        return false
    }
  } catch (error) {
    console.error(`Error testing ${provider} API key:`, error)
    return false
  }
}

async function testMailgunKey(apiKey: string, domain: string | null): Promise<boolean> {
  if (!domain) return false
  
  try {
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/stats/total`, {
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
      }
    })
    return response.ok
  } catch {
    return false
  }
}

async function testSendGridKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch {
    return false
  }
}

async function testResendKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    return response.ok
  } catch {
    return false
  }
}

async function testPostmarkKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.postmarkapp.com/server', {
      headers: {
        'X-Postmark-Server-Token': apiKey
      }
    })
    return response.ok
  } catch {
    return false
  }
}

async function getStoredApiKey(provider: string, userId: string): Promise<string | null> {
  try {
    // In production, implement secure storage using Supabase Vault or encrypted storage
    // For now, we'll check if configuration exists in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseClient
      .from('email_integrations')
      .select('is_enabled')
      .eq('user_id', userId)
      .eq('provider_id', provider)
      .single()

    if (error || !data?.is_enabled) {
      return null;
    }

    // TODO: Implement actual secure key retrieval from Vault
    // For now, return a placeholder to indicate key exists
    return 'PLACEHOLDER_KEY_EXISTS';
  } catch (error) {
    console.error('Error retrieving stored API key:', error);
    return null;
  }
}