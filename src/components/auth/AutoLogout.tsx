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
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/verify'

  useEffect(() => {
    if (isPublicPage) return

    const handleLogout = async () => {
      await supabase.auth.signOut()
      toast('You have been logged out due to inactivity.', { icon: '🔒' })
      router.push('/login')
    }

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Set timer to 1 minute (60000 ms)
      timeoutRef.current = setTimeout(handleLogout, 60000)
    }

    // Listen for any user interaction
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => window.addEventListener(event, resetTimer))

    // Initialize timer
    resetTimer()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [pathname, isPublicPage, router])

  return null // This is a silent logic component
}
