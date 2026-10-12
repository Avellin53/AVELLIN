import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Safely initialize Supabase client. Fallback to empty strings to prevent 500 crashes if env vars are missing during build.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // =========================================================================
  // 1. LIGHTWEIGHT SECURITY CHECK (SQL Injection & Directory Traversal Protection)
  // =========================================================================
  const urlString = request.url
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
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'Unknown Client IP'

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
            ip_address: ipAddress,
            status: 'unresolved',
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error('Failed to log suspicious payload in middleware:', err)
      }
    }

    console.warn(
      `[SECURITY ALERT] Blocked ${matchedPattern} from IP: ${ipAddress} | URL: ${urlString}`
    )

    // Block request with 403 Forbidden
    return new NextResponse('Forbidden: Suspicious Payload Detected', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // =========================================================================
  // 2. SUPABASE AUTH & SESSION ROUTING
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

  // IMPORTANT: Avoid calling getUser() in middleware unless strictly necessary, 
  // as it requires a network request. We use getSession() for faster edge routing.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Protected Routes Logic
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
