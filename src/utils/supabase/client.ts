import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Explicitly assign to variables to force Next.js to bundle them
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FATAL: Missing Supabase environment variables on the client.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
