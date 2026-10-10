'use server'

import { createClient } from '@supabase/supabase-js'

export async function checkUserExists(field: 'name' | 'email', value: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq(field, value)
    .maybeSingle()
    
  return !!data // Returns true if user exists, false if available
}

export async function syncProfileAfterSignup(profileData: any) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    
    // Insert into profiles bypassing RLS
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      profileData
    ])

    if (profileError) {
      console.error("Failed to sync profile:", profileError)
      return { error: profileError.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Error in syncProfileAfterSignup:", error)
    return { error: error.message || "Failed to sync profile" }
  }
}
