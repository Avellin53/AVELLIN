import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  Users,
  Store,
  ShieldCheck,
  ShieldAlert,
  PackageCheck,
  LogOut,
} from 'lucide-react'

import VendorCreationModal from './VendorCreationModal'
import ProductModerationTable from './ProductModerationTable'
import AdminDashboardTabs from './AdminDashboardTabs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check role === 'admin' in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const ADMIN_EMAIL = 'fortuneonyeagwaziam@gmail.com'
  const isAdmin = profile?.role === 'admin' || user.email === ADMIN_EMAIL

  if (!isAdmin) {
    redirect('/')
  }

  // Use service role key to bypass RLS for administrative stats & listings
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Auto-Sync Ghost Shoppers
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
  const authUsers = authData?.users || []
  const { data: profileData } = await supabaseAdmin.from('profiles').select('id')
  const profileIds = (profileData || []).map((p: any) => p.id)

  const missingProfiles = authUsers
    .filter((u) => !profileIds.includes(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Shopper',
      role: 'shopper',
      created_at: u.created_at,
    }))

  if (missingProfiles.length > 0) {
    await supabaseAdmin.from('profiles').insert(missingProfiles)
  }

  // Stat Card 1: Total Registered Users
  const { count: totalUsersCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Stat Card 2: Total Vendors
  const { count: vendorCount } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .ilike('role', 'vendor')

  // Stat Card 3: Total Products Live
  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Fetch unresolved security alerts for real-time monitoring
  let securityAlerts: any[] = []
  try {
    const { data: alertsData, error: alertsError } = await supabaseAdmin
      .from('security_logs')
      .select('*')
      .eq('status', 'unresolved')
      .order('created_at', { ascending: false })

    if (!alertsError && alertsData) {
      securityAlerts = alertsData
    }
  } catch (err) {
    console.warn('[AdminPage] security_logs table not yet queried or empty:', err)
  }

  // Users list for role management
  const { data: usersList } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false })

  // Moderation Products List ordered by newest first
  const { data: productsList } = await supabaseAdmin
    .from('products')
    .select('*, profiles(name)')
    .order('created_at', { ascending: false })

  // Server Action: Toggle user role
  async function toggleRole(userId: string, currentRole: string) {
    'use server'
    const { createClient } = await import('@supabase/supabase-js')
    const adminDb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const newRole = currentRole === 'shopper' ? 'vendor' : 'shopper'
    await adminDb.from('profiles').update({ role: newRole }).eq('id', userId)

    revalidatePath('/admin')
  }

  // Server Action: Logout
  async function handleLogout() {
    'use server'
    const cookieStore = await cookies()
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
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
    await supabaseClient.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-10 w-full max-w-[1050px] mx-auto pb-32">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 leading-tight">
              Admin Command Center
            </h1>
            <p className="text-sm text-neutral-500 font-medium">
              AVELLIN Operations & Moderation • {user.email}
            </p>
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

      {/* ======================================================== */}
      {/* 3 CORE STAT CARDS: Total Users, Total Products, Total Vendors */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Stat Card 1: Total Registered Users */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-blue-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Total Registered Users
              </p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">
              {totalUsersCount || 0}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Platform-wide profiles</p>
          </div>
        </div>

        {/* Stat Card 2: Total Products Live */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <PackageCheck size={20} className="text-purple-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Total Products Live
              </p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">
              {productCount || 0}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Active luxury catalog</p>
          </div>
        </div>

        {/* Stat Card 3: Total Vendors */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Store size={20} className="text-amber-500" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Total Vendors
              </p>
            </div>
            <p className="text-4xl font-extrabold text-neutral-900">
              {vendorCount || 0}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Verified partner ateliers</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADMIN TABS: Security Alerts | Product Moderation | User Roles */}
      {/* ======================================================== */}
      <AdminDashboardTabs
        securityAlerts={securityAlerts || []}
        productsList={productsList || []}
        usersTable={
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="text-lg font-bold text-neutral-900">User Role Management</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage user roles and promote shoppers to verified vendor status
              </p>
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
                        <p className="text-sm font-bold text-neutral-900">
                          {u.name || 'Unnamed User'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                            u.role === 'vendor'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : u.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600">
                          {new Date(u.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={toggleRole.bind(null, u.id, u.role)}>
                          <button
                            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${
                              u.role === 'shopper'
                                ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-md'
                                : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                            }`}
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
                          <p>No registered users found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </div>
  )
}
