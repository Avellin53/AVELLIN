'use server'

import { createClient } from '@supabase/supabase-js'

export async function checkUserExists(field: 'name' | 'email', value: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )
  
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq(field, value)
    .maybeSingle()
    
  return !!data // Returns true if user exists, false if available
}
