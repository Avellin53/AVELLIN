'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction({
  productId,
  rating,
  comment,
  videoUrl,
}: {
  productId: string;
  rating: number;
  comment: string;
  videoUrl?: string | null;
}) {
  try {
    if (!productId || !comment?.trim() || !rating) {
      return { success: false, error: 'Missing required review fields.' };
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
      return { success: false, error: 'You must be signed in to submit a review.' };
    }

    const cleanedComment = comment.trim();
    const validatedRating = Math.min(Math.max(Number(rating) || 5, 1), 5);

    // 1. Insert into reviews table
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        shopper_id: user.id,
        rating: validatedRating,
        comment: cleanedComment,
        video_url: videoUrl || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error inserting review:', insertError);
      return { success: false, error: insertError.message || 'Database error inserting review.' };
    }

    // 2. Fetch reviewer's display name from profiles
    let reviewerName = user.email?.split('@')[0] || 'Verified Shopper';
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.name) {
        reviewerName = profile.name;
      }
    } catch {
      // Non-fatal if profile lookup fails
    }

    // 3. Immediately revalidate Next.js cache for the product page
    revalidatePath(`/product/${productId}`);

    return {
      success: true,
      review: {
        ...newReview,
        profiles: { name: reviewerName },
      },
    };
  } catch (err: any) {
    console.error('Unhandled exception in submitReviewAction:', err);
    return {
      success: false,
      error: err?.message || 'Failed to submit review due to an unexpected error.',
    };
  }
}
