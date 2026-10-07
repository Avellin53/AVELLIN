'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={handleSignOut} className="w-full bg-white border border-linen-border text-terracotta font-bold rounded-xl h-12 flex items-center justify-center hover:bg-terracotta/5 transition shadow-sm mt-auto">
      Sign Out
    </button>
  );
}
