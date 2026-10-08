'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createVendor(formData: FormData) {
  const brandName = formData.get('brandName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!brandName || !email || !password) {
    return { error: 'All fields are required' }
  }

  const adminDb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Create auth user safely via admin API to avoid logging the current admin out
  const { data, error: authError } = await adminDb.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the vendor's email
  })

  if (authError) return { error: authError.message }

  // 2. Insert into profiles with vendor role
  const { error: profileError } = await adminDb.from('profiles').insert([{
    id: data.user.id,
    email,
    name: brandName,
    role: 'vendor',
    created_at: new Date().toISOString()
  }])

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
