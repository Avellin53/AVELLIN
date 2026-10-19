'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

export default function AutoLogout() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Do not run on public pages
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify' ||
    pathname === '/home' ||
    pathname === '/browse' ||
    pathname.startsWith('/product')

  useEffect(() => {
    let isMounted = true

    const checkSessionAndSetupTimer = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted || !session) return // Do not trigger auto-logout for guest browsers

        const handleLogout = async () => {
          await supabase.auth.signOut()
          toast('You have been logged out due to inactivity.', { icon: '🔒' })
          router.push('/login')
        }

        const resetTimer = () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          // Set timer to 15 minutes for security without disrupting active shopping
          timeoutRef.current = setTimeout(handleLogout, 15 * 60 * 1000)
        }

        // Listen for user interaction
        const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click']
        events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }))

        resetTimer()

        return () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          events.forEach((event) => window.removeEventListener(event, resetTimer))
        }
      } catch (err) {
        console.warn('AutoLogout session check error:', err)
      }
    }

    let cleanup: (() => void) | undefined
    checkSessionAndSetupTimer().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      isMounted = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (cleanup) cleanup()
    }
  }, [pathname, isPublicPage, router, supabase])

  return null // This is a silent logic component
}
