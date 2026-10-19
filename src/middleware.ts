import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// =========================================================================
// 1. EDGE RATE LIMITER (Layer 7 DDoS Protection: 60 requests/min per IP)
// =========================================================================
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute sliding window
const RATE_LIMIT_MAX_REQUESTS = 60 // Max 60 requests per minute per IP

// In-memory sliding window history: Map<ip, Array<timestamp>>
const ipRequestHistory = new Map<string, number[]>()
const ddosLoggedAt = new Map<string, number>()

function checkRateLimit(ip: string): {
  allowed: boolean
  count: number
  retryAfter: number
} {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Routine map cleanup to prevent unbounded memory growth
  if (ipRequestHistory.size > 2000) {
    for (const [key, timestamps] of ipRequestHistory.entries()) {
      const active = timestamps.filter((t) => t > windowStart)
      if (active.length === 0) {
        ipRequestHistory.delete(key)
        ddosLoggedAt.delete(key)
      } else {
        ipRequestHistory.set(key, active)
      }
    }
  }

  const existing = ipRequestHistory.get(ip) || []
  const activeTimestamps = existing.filter((t) => t > windowStart)

  if (activeTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestInWindow = activeTimestamps[0] || now
    const retryAfter = Math.max(1, Math.ceil((oldestInWindow + RATE_LIMIT_WINDOW_MS - now) / 1000))
    return {
      allowed: false,
      count: activeTimestamps.length + 1,
      retryAfter,
    }
  }

  activeTimestamps.push(now)
  ipRequestHistory.set(ip, activeTimestamps)
  return {
    allowed: true,
    count: activeTimestamps.length,
    retryAfter: 0,
  }
}

// =========================================================================
// 2. DOMAIN WHITELIST VALIDATION (Anti-Cloning & Phishing Protection)
// =========================================================================
function isAllowedDomain(urlOrOrigin: string, currentHost?: string | null): boolean {
  try {
    const parsed = new URL(
      urlOrOrigin.startsWith('http://') || urlOrOrigin.startsWith('https://')
        ? urlOrOrigin
        : `https://${urlOrOrigin}`
    )
    const hostname = parsed.hostname.toLowerCase()

    // 1. Allow localhost and local loopback for development
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.localhost')
    ) {
      return true
    }

    // 2. Allow same host (direct requests on same deployment)
    if (currentHost) {
      const cleanHost = currentHost.split(':')[0].toLowerCase()
      if (hostname === cleanHost) {
        return true
      }
    }

    // 3. Allow official Vercel domains (*.vercel.app)
    if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
      return true
    }

    // 4. Allow official production domains if configured
    if (
      hostname === 'avellin.com' ||
      hostname.endsWith('.avellin.com') ||
      hostname === 'avellin.ng' ||
      hostname.endsWith('.avellin.ng')
    ) {
      return true
    }

    // 5. Allow environment variables if present
    if (process.env.VERCEL_URL) {
      const vercelHost = process.env.VERCEL_URL.toLowerCase().split(':')[0]
      if (hostname === vercelHost) return true
    }
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      try {
        const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL)
        if (hostname === siteUrl.hostname.toLowerCase()) return true
      } catch {}
    }

    return false
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const urlString = request.url

  // Safely initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'

  // =========================================================================
  // 1. EDGE RATE LIMITING (Layer 7 DDoS Protection)
  // =========================================================================
  const rateLimit = checkRateLimit(clientIp)
  if (!rateLimit.allowed) {
    const now = Date.now()
    const lastLogged = ddosLoggedAt.get(clientIp) || 0

    // Throttle duplicate security log inserts to once every 30 seconds per IP
    if (now - lastLogged > 30000) {
      ddosLoggedAt.set(clientIp, now)

      if (supabaseUrl && serviceRoleKey) {
        ;(async () => {
          try {
            const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
              auth: { persistSession: false },
            })
            await adminClient.from('security_logs').insert([
              {
                event_type: 'DDOS_ATTEMPT',
                details: {
                  reason: `Exceeded rate limit of ${RATE_LIMIT_MAX_REQUESTS} requests/minute (Layer 7 DDoS protection)`,
                  request_count: rateLimit.count,
                  target_url: urlString,
                  path: pathname,
                  user_agent: request.headers.get('user-agent') || 'Unknown',
                  blocked_at: new Date().toISOString(),
                },
                ip_address: clientIp,
                status: 'unresolved',
                created_at: new Date().toISOString(),
              },
            ])
          } catch (err) {
            console.error('Failed to log DDOS_ATTEMPT to security_logs:', err)
          }
        })()
      }
    }

    console.warn(
      `[SECURITY ALERT] Blocked DDOS_ATTEMPT from IP: ${clientIp} (${rateLimit.count} reqs/min)`
    )

    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Maximum 60 requests per minute allowed.',
        retryAfter: rateLimit.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimit.retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // =========================================================================
  // 2. STRICT CORS & API PROTECTION (Anti-Cloning & Phishing Protection)
  // =========================================================================
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')
  const hostHeader = request.headers.get('host')
  const isApiRoute = pathname.startsWith('/api/')

  if (isApiRoute) {
    // 1. Check Origin header if present
    if (originHeader && !isAllowedDomain(originHeader, hostHeader)) {
      console.warn(
        `[SECURITY ALERT] Blocked API request with unauthorized Origin: ${originHeader} from IP: ${clientIp}`
      )
      return new NextResponse('Forbidden: Cross-Origin Request Blocked (Unauthorized Origin)', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    // 2. Check Referer header if present
    if (refererHeader && !isAllowedDomain(refererHeader, hostHeader)) {
      console.warn(
        `[SECURITY ALERT] Blocked API request with unauthorized Referer: ${refererHeader} from IP: ${clientIp}`
      )
      return new NextResponse('Forbidden: Cross-Origin Request Blocked (Unauthorized Referer)', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    // 3. Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      const allowedOrigin = originHeader && isAllowedDomain(originHeader, hostHeader)
        ? originHeader
        : 'https://avellin-three.vercel.app'
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
  }

  // =========================================================================
  // 3. LIGHTWEIGHT SECURITY CHECK (SQL Injection & Directory Traversal Protection)
  // =========================================================================
  let decodedUrl = urlString
  try {
    decodedUrl = decodeURIComponent(urlString)
  } catch {
    // Keep raw string if URI decode fails
  }

  // Detect SQL injection patterns: SELECT, UNION, OR 1=1
  const hasSqlInjection =
    /\b(SELECT|UNION)\b/i.test(decodedUrl) ||
    /OR\s+['"]?1['"]?\s*=\s*['"]?1['"]?/i.test(decodedUrl)

  // Detect directory traversal patterns: ../ or ..\
  const hasDirectoryTraversal =
    /\.\.[\/\\]/i.test(decodedUrl) || /\.\.%2f/i.test(urlString)

  if (hasSqlInjection || hasDirectoryTraversal) {
    const matchedPattern = hasSqlInjection
      ? 'SQL_INJECTION'
      : 'DIRECTORY_TRAVERSAL'

    // Log 'SUSPICIOUS_PAYLOAD' to security_logs table via supabaseAdmin
    if (supabaseUrl && serviceRoleKey) {
      try {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        })
        await adminClient.from('security_logs').insert([
          {
            event_type: 'SUSPICIOUS_PAYLOAD',
            details: {
              target_url: urlString,
              matched_pattern: matchedPattern,
              reason: hasSqlInjection
                ? 'SQL Injection string (SELECT / UNION / OR 1=1) detected in request URL'
                : 'Directory traversal sequence (../) detected in request URL',
              user_agent: request.headers.get('user-agent') || 'Unknown User-Agent',
            },
            ip_address: clientIp,
            status: 'unresolved',
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error('Failed to log suspicious payload in middleware:', err)
      }
    }

    console.warn(
      `[SECURITY ALERT] Blocked ${matchedPattern} from IP: ${clientIp} | URL: ${urlString}`
    )

    // Block request with 403 Forbidden
    return new NextResponse('Forbidden: Suspicious Payload Detected', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // =========================================================================
  // 4. SUPABASE AUTH & SESSION ROUTING
  // =========================================================================
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Attach CORS headers if origin is allowed
  if (originHeader && isAllowedDomain(originHeader, hostHeader)) {
    supabaseResponse.headers.set('Access-Control-Allow-Origin', originHeader)
    supabaseResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    supabaseResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    )
    supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase Environment Variables are missing. Middleware bypassed.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Avoid calling getUser() in middleware unless strictly necessary, 
  // as it requires a network request. We use getSession() for faster edge routing.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected Routes Logic: ONLY protect routes like /profile, /admin, /cart/checkout, and /vendor
  // Unauthenticated users must be able to view the homepage, search, and view individual product pages freely.
  const isProtectedRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/cart/checkout') ||
    pathname.startsWith('/vendor')
  
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname + (request.nextUrl.search || ''))
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons (public folder assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
