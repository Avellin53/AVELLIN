import { createClient } from '@supabase/supabase-js'

export type SecurityEventType =
  | 'BRUTE_FORCE'
  | 'SUSPICIOUS_PAYLOAD'
  | 'UNAUTHORIZED_ACCESS'
  | 'DDOS_ATTEMPT'
  | string

export interface SecurityLogEntry {
  id?: string
  event_type: SecurityEventType
  details: Record<string, any> | string
  ip_address?: string
  status?: 'unresolved' | 'resolved'
  created_at?: string
}

export async function logSecurityEvent({
  eventType,
  details,
  ipAddress = 'Unknown IP',
}: {
  eventType: SecurityEventType
  details: Record<string, any> | string
  ipAddress?: string
}) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.warn('Cannot log security event: missing Supabase credentials.')
      return
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const formattedDetails =
      typeof details === 'object' && details !== null
        ? details
        : { message: String(details) }

    const { error } = await supabaseAdmin.from('security_logs').insert([
      {
        event_type: eventType,
        details: formattedDetails,
        ip_address: ipAddress,
        status: 'unresolved',
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Database security log insertion error:', error.message)
    }
  } catch (err) {
    console.error('Exception in logSecurityEvent:', err)
  }
}
