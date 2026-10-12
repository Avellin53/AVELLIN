'use server'

import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { logSecurityEvent } from '@/utils/security'

// In-memory failed attempts tracker per email
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const BRUTE_FORCE_THRESHOLD = 3
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes window

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
      {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name || 'User',
        role: profileData.role || 'shopper',
      },
    ])

    if (profileError) {
      console.error('Failed to sync profile:', profileError)
      return { error: profileError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in syncProfileAfterSignup:', error)
    return { error: error.message || 'Failed to sync profile' }
  }
}

/**
 * Auth Monitoring: Tracks failed login attempts per email.
 * If invalid credentials fail multiple times for the same email,
 * records a 'BRUTE_FORCE' security event in `security_logs`.
 */
export async function trackFailedLogin(email: string) {
  try {
    if (!email) return

    const normalizedEmail = email.toLowerCase().trim()
    const headerList = await headers()
    const ipAddress =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      'Unknown Client IP'

    const now = Date.now()
    const current = failedLoginAttempts.get(normalizedEmail)

    let newCount = 1
    if (current && now - current.lastAttempt < ATTEMPT_WINDOW_MS) {
      newCount = current.count + 1
    }

    failedLoginAttempts.set(normalizedEmail, {
      count: newCount,
      lastAttempt: now,
    })

    // If threshold reached or exceeded, log BRUTE_FORCE alert
    if (newCount >= BRUTE_FORCE_THRESHOLD) {
      await logSecurityEvent({
        eventType: 'BRUTE_FORCE',
        details: {
          target_email: normalizedEmail,
          consecutive_failed_attempts: newCount,
          reason: `Repeated invalid credentials failure (${newCount} attempts within 15 mins)`,
          user_agent: headerList.get('user-agent') || 'Unknown User-Agent',
        },
        ipAddress,
      })
      console.warn(
        `[SECURITY ALERT] Brute-force attempt detected for ${normalizedEmail} from ${ipAddress}`
      )
    }
  } catch (err) {
    console.error('Error tracking failed login:', err)
  }
}

/**
 * Resets failed login attempts upon successful authentication.
 */
export async function trackSuccessfulLogin(email: string) {
  if (!email) return
  failedLoginAttempts.delete(email.toLowerCase().trim())
}
