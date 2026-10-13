import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// A lightweight memory store to track IP requests per minute for DDoS protection
const rateLimitMap = new Map();

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // =========================================================================
  // 1. ANTI-IMPERSONATION & SECURITY HEADERS
  // =========================================================================
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Safely initialize Supabase client variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { pathname } = request.nextUrl
  
  // Centralized IP capture for both DDoS and Payload checks
  const ipAddress = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'Unknown_IP'

  // =========================================================================
  // 2. STRICT CORS FOR API ROUTES (Block Fake Clones)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://avellin-three.vercel.app',
      'http://localhost:3000'
    ]

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: CORS policy violation. Unauthorized origin.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // =========================================================================
  // 3. LAYER 7 DDOS & SPAM PROTECTION (Rate Limiting)
  // =========================================================================
  if (ipAddress !== 'Unknown_IP' && pathname.startsWith('/api/')) {
    const currentMinute = Math.floor(Date.now() / 60000); 
    const key = `${ipAddress}:${currentMinute}`;
    
    const requestCount = (rateLimitMap.get(key) || 0) + 1;
    rateLimitMap.set(key, requestCount);

    if (requestCount > 60) {
      console.warn(`[SECURITY_ALERT] DDoS or Spam blocked from IP: ${ipAddress}`);
      
      // Push the alert visually to your Admin Dashboard Database
      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/security_logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              event_type: 'DDOS_ATTEMPT',
              ip_address: ipAddress,
              details: { reason: 'Blocked 60+ requests per minute', path: pathname },
              status: 'unresolved'
            })
          });
        } catch (err) {
          console.error("Failed to log DDoS event", err);
        }
      }
      
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests. Your IP has been temporarily throttled.' }),
        { status: 429, headers: { 'Retry-After': '60', 'Content-Type': 'application/json' } }
      );
    }
  }

  // =========================================================================
  // 4. LIGHTWEIGHT SECURITY CHECK (SQL Injection & Directory Traversal)
  // =========================================================================
  const urlString = request.url
  let decodedUrl = urlString
  try {
    decodedUrl = decodeURIComponent(urlString)
  } catch {
    // Keep raw string if URI decode fails
  }

  const hasSqlInjection = /\b(SELECT|UNION)\b/i.test(decodedUrl) || /OR\s+['"]?1['"]?\s*=\s*['"]?1['"]?/i.test(decodedUrl)
  const hasDirectoryTraversal = /\.\.[\/\\]/i.test(decodedUrl) || /\.\.%2f/i.test(urlString)

  if (hasSqlInjection || hasDirectoryTraversal) {
    const matchedPattern = hasSqlInjection ? 'SQL_INJECTION' : 'DIRECTORY_TRAVERSAL'

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
            ip_address: ipAddress,
            status: 'unresolved',
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error('Failed to log suspicious payload in middleware:', err)
      }
    }

    console.warn(`[SECURITY ALERT] Blocked ${matchedPattern} from IP: ${ipAddress} | URL: ${urlString}`)

    return new NextResponse('Forbidden: Suspicious Payload Detected', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // =========================================================================
  // 5. SUPABASE AUTH & SESSION ROUTING
  // =========================================================================
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

  const { data: { session } } = await supabase.auth.getSession()

  const isProtectedRoute = pathname.startsWith('/browse') || pathname.startsWith('/vendor') || pathname.startsWith('/product')
  
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif
    |webp)$).*)',
  ],
      }
