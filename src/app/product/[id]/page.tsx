import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import AddToCartButton from './AddToCartButton';
import ReviewForm from './ReviewForm';
import { ChevronLeft, Star, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch product and joined profile (vendor) data
  const { data: product, error } = await supabase
    .from('products')
    .select('*, profiles:vendor_id(name, email, whatsapp_number)')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch reviews for this product
  // Make sure the table `reviews` exists. It should have product_id, shopper_id, rating, comment, created_at.
  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('*, profiles:shopper_id(name)')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false });

  // Compute average rating
  const avgRating = reviews && reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Contact vendor link (fallback to mailto if no whatsapp)
  const vendorEmail = product.profiles?.email;
  const whatsappNumber = product.profiles?.whatsapp_number;
  const vendorName = product.profiles?.name || 'the vendor';
  const messageVendorLink = whatsappNumber 
    ? `https://wa.me/${whatsappNumber}?text=Hi! I'm interested in your product on AVELLIN: ${encodeURIComponent(product.title)}`
    : `mailto:${vendorEmail}?subject=Inquiry about ${encodeURIComponent(product.title)}`;

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32">
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white border-b border-linen-border sticky top-0 z-40 shadow-sm">
        <Link href="/home" className="p-2 hover:bg-linen-surface rounded-full transition text-charcoal mr-2">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-charcoal line-clamp-1">{product.title}</h1>
      </div>

      <div className="flex flex-col md:flex-row md:max-w-6xl md:mx-auto w-full">
        {/* Left/Top: Image Container */}
        <div className="w-full md:w-1/2 bg-neutral-100 flex items-center justify-center relative h-[400px] md:h-[600px] overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-sm font-bold text-neutral-400 uppercase">No Image Available</div>
          )}
        </div>

        {/* Right/Bottom: Product Details */}
        <div className="p-6 w-full md:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-terracotta bg-terracotta/10 px-2 py-1 rounded-full">
              {product.category || 'Luxury'}
            </span>
            {Number(avgRating) > 0 && (
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-[10px] font-bold">
                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                {avgRating}
              </div>
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal leading-tight mb-2">
            {product.title}
          </h2>
          
          <p className="text-sm text-charcoal-secondary font-medium mb-6">
            By <span className="text-charcoal font-bold">{vendorName}</span>
          </p>

          <div className="mb-6">
            <span className="text-3xl font-extrabold text-charcoal">
              ₦{product.price?.toLocaleString()}
            </span>
          </div>

          <div className="prose prose-sm text-charcoal-secondary mb-8">
            <p>{product.description || "No description provided."}</p>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            {/* Add to Cart Component */}
            <AddToCartButton product={product} />

            {/* Message Vendor Button */}
            <a 
              href={messageVendorLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white border border-charcoal text-charcoal font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm"
            >
              <MessageCircle size={20} />
              Message Vendor
            </a>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-12 border-t border-linen-border pt-8">
            <h3 className="text-xl font-bold text-charcoal mb-6">Customer Reviews</h3>
            
            {reviewError ? (
              <div className="flex items-center gap-2 text-ochre text-sm bg-ochre/10 p-4 rounded-xl">
                <AlertCircle size={16} />
                <p>Reviews table not configured. Please run the reviews table SQL script.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-linen-border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-charcoal">
                          {review.profiles?.name || 'Anonymous Shopper'}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-secondary">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-charcoal-secondary">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}

            {user ? (
              <ReviewForm productId={product.id} shopperId={user.id} />
            ) : (
              <div className="mt-6 bg-linen-surface p-4 rounded-xl border border-linen-border text-center">
                <p className="text-sm text-charcoal-secondary">Sign in to leave a review.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
