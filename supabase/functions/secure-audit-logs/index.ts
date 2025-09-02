import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { action, table_name, record_id, old_values, new_values, ip_address } = await req.json()

      // Validate required fields
      if (!action || !table_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: action, table_name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Insert audit log entry
      const { error: insertError } = await supabase
        .from('security_audit_logs')
        .insert({
          user_id: user.id,
          action,
          table_name,
          record_id,
          old_values,
          new_values,
          ip_address,
          user_agent: req.headers.get('User-Agent')
        })

      if (insertError) {
        console.error('Failed to insert audit log:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to log audit entry' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Check if user is company owner or admin
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('role, company_owner_id')
        .eq('auth_user_id', user.id)
        .single()

      const isOwner = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (employeeError && isOwner.error) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Allow company owners and admins to view audit logs
      const canViewLogs = isOwner.data?.length > 0 || 
                         employee?.role === 'admin' || 
                         employee?.company_owner_id === user.id

      if (!canViewLogs) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: logs, error: logsError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (logsError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch audit logs' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ logs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Secure audit logs error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})