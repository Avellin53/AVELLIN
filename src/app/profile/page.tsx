import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SignOutButton from './SignOutButton';
import BackButton from '@/components/ui/BackButton';
import Link from 'next/link';
import { Package, Inbox, Heart, Store, BookUser, UserCog, UserX, ChevronRight } from 'lucide-react';

const MenuItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
  <Link href={href} className="flex justify-between items-center px-4 py-4 border-b border-neutral-100 bg-white hover:bg-neutral-50 cursor-pointer transition">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={20} className="text-neutral-500" />}
      <span className="text-sm font-medium text-neutral-800">{label}</span>
    </div>
    <ChevronRight size={18} className="text-neutral-400" />
  </Link>
);

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  
  const firstName = profile?.name?.split(' ')[0] || 'User';
  const email = profile?.email || user.email;

  return (
    <div className="relative flex flex-col min-h-screen bg-linen w-full max-w-[420px] mx-auto pb-24">
      <BackButton />
      
      {/* Header Section */}
      <div className="px-4 py-6 mt-12 bg-white border-b border-neutral-100">
        <h1 className="text-xl font-bold text-neutral-900">Welcome {firstName}!</h1>
        <p className="text-sm text-amber-600 mt-1">{email}</p>
      </div>

      {/* My Avellin Account */}
      <div className="mt-2 bg-white">
        <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-4 py-3 border-b border-neutral-100">My Avellin Account</h2>
        <MenuItem href="/profile/orders" icon={Package} label="Orders" />
        <MenuItem href="/profile/inbox" icon={Inbox} label="Inbox" />
        <MenuItem href="/profile/saved" icon={Heart} label="Saved Items" />
        <MenuItem href="/profile/following" icon={Store} label="Followed Ateliers" />
      </div>

      <div className="w-full h-2 bg-neutral-100"></div>

      {/* My Settings */}
      <div className="bg-white">
        <h2 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-4 py-3 border-b border-neutral-100">My Settings</h2>
        <MenuItem href="/profile/address" icon={BookUser} label="Address Book" />
        <MenuItem href="/profile/settings" icon={UserCog} label="Account Management" />
        <MenuItem href="/profile/close" icon={UserX} label="Close Account" />
      </div>

      {/* Logout */}
      <div className="flex justify-center mt-6 bg-white border-y border-neutral-100">
        <SignOutButton />
      </div>
    </div>
  );
}
