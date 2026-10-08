import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  const ADMIN_EMAIL = 'fortuneonyeagwaziam@gmail.com'

  // Strict server-side check: if not logged in or email doesn't match admin, hard redirect immediately
  if (!session || session.user?.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Admin Console</h1>
        {/* Admin metrics and management UI */}
        <p className="text-sm text-neutral-600">Welcome back, Administrator.</p>
      </div>
    </div>
  )
}
