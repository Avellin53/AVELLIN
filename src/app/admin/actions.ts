'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function createVendor(formData: FormData) {
  const brandName = formData.get('brandName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!brandName || !email || !password) {
    return { error: 'All fields are required' }
  }

  const adminDb = getAdminClient()

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

export async function deleteProductAction(productId: string) {
  try {
    const adminDb = getAdminClient()
    const { error } = await adminDb.from('products').delete().eq('id', productId)
    if (error) {
      console.error('Admin delete product error:', error)
      return { error: error.message }
    }
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Admin delete product exception:', err)
    return { error: err.message || 'Failed to delete product' }
  }
}

export async function updateProductAction(
  productId: string,
  updates: { title: string; price: number }
) {
  try {
    const adminDb = getAdminClient()
    const { error } = await adminDb
      .from('products')
      .update({
        title: updates.title,
        price: updates.price,
      })
      .eq('id', productId)

    if (error) {
      console.error('Admin update product error:', error)
      return { error: error.message }
    }
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error('Admin update product exception:', err)
    return { error: err.message || 'Failed to update product' }
  }
}

export async function updateSecurityAlertStatus(
  alertId: string,
  action: 'resolved' | 'blocked'
) {
  try {
    const adminDb = getAdminClient()
    const { error } = await adminDb
      .from('security_logs')
      .update({ status: action })
      .eq('id', alertId)

    if (error) {
      console.error(`Failed to update security alert to ${action}:`, error.message)
      return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    console.error(`Exception updating security alert to ${action}:`, err)
    return { error: err.message || `Failed to update alert to ${action}` }
  }
}

export async function resolveSecurityAlert(alertId: string) {
  return updateSecurityAlertStatus(alertId, 'resolved')
}


