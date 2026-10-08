import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Users, LayoutDashboard, ShieldCheck, Activity, LogOut } from 'lucide-react'

import VendorCreationModal from './VendorCreationModal'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const ADMIN_EMAIL = 'fortuneonyeagwaziam@gmail.com'

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  // Fetch metrics
  const { count: shopperCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'shopper');

  const { count: vendorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'vendor');

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { data: usersList } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  // Server Actions
  async function toggleRole(userId: string, currentRole: string) {
    'use server'
    // Use service role to bypass RLS for admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const adminDb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    const newRole = currentRole === 'shopper' ? 'vendor' : 'shopper';
    await adminDb.from('profiles').update({ role: newRole }).eq('id', userId);
    
    revalidatePath('/admin')
  }

  async function handleLogout() {
    'use server'
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-10 w-full max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 leading-tight">Admin Console</h1>
            <p className="text-sm text-neutral-500 font-medium">Welcome back, {user.email}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <VendorCreationModal />
          <form action={handleLogout} className="w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-bold text-sm rounded-xl hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition shadow-sm w-full sm:w-auto">
              <LogOut size={16} />
              Secure Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-blue-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Total Shoppers</p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">{shopperCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <LayoutDashboard size={20} className="text-amber-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Total Vendors</p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">{vendorCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={20} className="text-purple-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Live Products</p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">{productCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
          <h2 className="text-lg font-bold text-neutral-900">Recent Registrations</h2>
          <p className="text-xs text-neutral-500 mt-1">Manage user roles and permissions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400 font-bold bg-white">
                <th className="px-6 py-4 font-bold">User Details</th>
                <th className="px-6 py-4 font-bold">Account Role</th>
                <th className="px-6 py-4 font-bold">Registered Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {usersList?.map((u: any) => (
                <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-neutral-900">{u.name || 'Unnamed User'}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${u.role === 'vendor' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">
                      {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleRole.bind(null, u.id, u.role)}>
                      <button 
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${u.role === 'shopper' ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-md' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}
                      >
                        {u.role === 'shopper' ? 'Promote to Vendor' : 'Revoke Vendor'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!usersList || usersList.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-sm text-neutral-500">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <Users size={32} className="mb-3" />
                      <p>No users found in the system.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
