'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleFollowVendorAction({
  vendorId,
}: {
  vendorId: string;
}): Promise<{ success: boolean; isFollowing?: boolean; error?: string }> {
  try {
    if (!vendorId) {
      return { success: false, error: 'Vendor ID is required' };
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Sign in to follow this designer' };
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('vendor_follows')
      .select('id')
      .eq('shopper_id', user.id)
      .eq('vendor_id', vendorId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('vendor_follows check error:', checkError.message);
    }

    if (existingFollow) {
      // Unfollow: delete row
      const { error: deleteError } = await supabase
        .from('vendor_follows')
        .delete()
        .eq('shopper_id', user.id)
        .eq('vendor_id', vendorId);

      if (deleteError) {
        throw deleteError;
      }

      revalidatePath('/profile/followed-vendors');
      revalidatePath('/profile/following');
      return { success: true, isFollowing: false };
    } else {
      // Follow: insert row
      const { error: insertError } = await supabase
        .from('vendor_follows')
        .insert({
          shopper_id: user.id,
          vendor_id: vendorId,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }

      revalidatePath('/profile/followed-vendors');
      revalidatePath('/profile/following');
      return { success: true, isFollowing: true };
    }
  } catch (err: any) {
    console.error('Error in toggleFollowVendorAction:', err);
    return {
      success: false,
      error: err?.message || 'Failed to update follow status',
    };
  }
}

export async function getFollowStatusAction({
  vendorId,
}: {
  vendorId: string;
}): Promise<{ isFollowing: boolean }> {
  try {
    if (!vendorId) return { isFollowing: false };

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { isFollowing: false };

    const { data } = await supabase
      .from('vendor_follows')
      .select('id')
      .eq('shopper_id', user.id)
      .eq('vendor_id', vendorId)
      .maybeSingle();

    return { isFollowing: !!data };
  } catch {
    return { isFollowing: false };
  }
}

export async function getFollowedVendorsAction(): Promise<{
  vendors: any[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { vendors: [], error: 'Not authenticated' };
    }

    // Query vendor_follows
    const { data: follows, error: followsError } = await supabase
      .from('vendor_follows')
      .select('vendor_id, created_at')
      .eq('shopper_id', user.id)
      .order('created_at', { ascending: false });

    if (followsError) {
      console.warn('Error fetching follows:', followsError.message);
      return { vendors: [] };
    }

    if (!follows || follows.length === 0) {
      return { vendors: [] };
    }

    const vendorIds = follows.map((f: any) => f.vendor_id).filter(Boolean);

    // Fetch vendor profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, created_at')
      .in('id', vendorIds);

    // Also fetch sample products from these vendors to display product count or preview
    const { data: products } = await supabase
      .from('products')
      .select('id, vendor_id, image_url, title, price')
      .in('vendor_id', vendorIds);

    const productsByVendor: Record<string, any[]> = {};
    if (products) {
      products.forEach((p: any) => {
        if (!productsByVendor[p.vendor_id]) {
          productsByVendor[p.vendor_id] = [];
        }
        productsByVendor[p.vendor_id].push(p);
      });
    }

    const vendorMap: Record<string, any> = {};
    if (profiles) {
      profiles.forEach((p: any) => {
        vendorMap[p.id] = p;
      });
    }

    const fullVendors = follows.map((f: any) => {
      const profile = vendorMap[f.vendor_id] || {};
      const vendorProducts = productsByVendor[f.vendor_id] || [];
      return {
        id: f.vendor_id,
        name: profile.name || 'Verified Atelier',
        email: profile.email || '',
        phone: profile.phone || '',
        followedAt: f.created_at,
        productCount: vendorProducts.length,
        previewImages: vendorProducts.slice(0, 3).map((p: any) => p.image_url).filter(Boolean),
      };
    });

    return { vendors: fullVendors };
  } catch (err: any) {
    console.error('Error in getFollowedVendorsAction:', err);
    return { vendors: [], error: err?.message };
  }
}
