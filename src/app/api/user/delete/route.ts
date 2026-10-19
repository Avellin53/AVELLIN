import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to delete your account.' },
        { status: 401 }
      );
    }

    // Use service role admin client to delete the user from auth.users
    const adminClient = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Delete user from profiles first if needed
    try {
      await adminClient.from('profiles').delete().eq('id', user.id);
    } catch (profileErr) {
      console.warn('Profile deletion warning:', profileErr);
    }

    // Delete user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Error deleting user via Supabase admin:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Sign out user session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Account deletion exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
