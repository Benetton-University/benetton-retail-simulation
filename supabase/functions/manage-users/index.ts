import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify caller identity
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return respond({ error: 'Unauthorized' }, 401)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return respond({ error: 'Unauthorized' }, 401)

    // Verify caller is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('email', user.email)
      .single()

    if (!roleData || roleData.role !== 'admin') return respond({ error: 'Forbidden' }, 403)

    const { action, ...payload } = await req.json()
    const tempPassword = Deno.env.get('TEMP_PASSWORD') ?? 'Benetton2026!'

    // --- LIST ---
    if (action === 'list_users') {
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return respond({ users: data })
    }

    // --- CREATE SINGLE ---
    if (action === 'create_user') {
      const { email, name, role } = payload
      const assignedRole = (role ?? 'learner').toLowerCase()

      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      })

      if (createError) {
        const msg = createError.message.toLowerCase()
        if (msg.includes('already') && msg.includes('registered')) {
          // Existing auth user — just sync the role record
          const { error: upsertError } = await supabaseAdmin
            .from('user_roles')
            .upsert({ email, role: assignedRole, name }, { onConflict: 'email' })
          if (upsertError) throw upsertError
          return respond({ status: 'updated', email, tempPassword })
        }
        throw createError
      }

      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert([{ email, role: assignedRole, name }])
      if (roleError) throw roleError

      return respond({ status: 'created', email, tempPassword })
    }

    // --- BULK CREATE ---
    if (action === 'bulk_create') {
      const { users } = payload as { users: { email: string; name?: string; role?: string }[] }
      const results: { email: string; status: string; message?: string }[] = []

      for (const u of users) {
        const assignedRole = (u.role ?? 'learner').toLowerCase()
        try {
          const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: tempPassword,
            email_confirm: true,
          })

          if (createError) {
            const msg = createError.message.toLowerCase()
            if (msg.includes('already') && msg.includes('registered')) {
              await supabaseAdmin
                .from('user_roles')
                .upsert({ email: u.email, role: assignedRole, name: u.name }, { onConflict: 'email' })
              results.push({ email: u.email, status: 'updated' })
            } else {
              results.push({ email: u.email, status: 'error', message: createError.message })
            }
            continue
          }

          await supabaseAdmin
            .from('user_roles')
            .insert([{ email: u.email, role: assignedRole, name: u.name }])
          results.push({ email: u.email, status: 'created' })
        } catch (e: unknown) {
          results.push({ email: u.email, status: 'error', message: (e as Error).message })
        }
      }

      return respond({ results, tempPassword })
    }

    // --- UPDATE ---
    if (action === 'update_user') {
      const { email, name, role } = payload
      const { error } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role.toLowerCase(), name })
        .eq('email', email)
      if (error) throw error
      return respond({ status: 'updated' })
    }

    // --- DELETE ---
    if (action === 'delete_user') {
      const { email } = payload

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      const authUser = authUsers?.users.find((u) => u.email === email)

      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('email', email)
      if (roleError) throw roleError

      if (authUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id)
      }

      return respond({ status: 'deleted' })
    }

    // --- BULK DELETE ---
    if (action === 'bulk_delete') {
      const { emails } = payload as { emails: string[] }

      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

      for (const email of emails) {
        await supabaseAdmin.from('user_roles').delete().eq('email', email)
        const authUser = authUsers?.users.find((u) => u.email === email)
        if (authUser) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id)
        }
      }

      return respond({ status: 'deleted', count: emails.length })
    }

    return respond({ error: 'Unknown action' }, 400)
  } catch (err: unknown) {
    return respond({ error: (err as Error).message }, 500)
  }
})
