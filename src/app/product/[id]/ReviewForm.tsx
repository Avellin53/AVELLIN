"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function ReviewForm({ productId, shopperId }: { productId: string, shopperId: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    
    const { error } = await supabase.from('reviews').insert([
      {
        product_id: productId,
        shopper_id: shopperId,
        rating,
        comment,
        created_at: new Date().toISOString(),
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to submit review.");
      console.error(error);
    } else {
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      // Using window.location.reload to refresh the server component list of reviews.
      window.location.reload();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-linen-border mt-6 shadow-sm">
      <h3 className="font-bold text-charcoal mb-3">Leave a Review</h3>
      
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star 
              size={24} 
              className={`transition-colors ${star <= (hoveredRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about this piece..."
        className="w-full bg-linen-surface border border-linen-border rounded-lg p-3 text-sm focus:outline-none focus:border-terracotta resize-none mb-3"
        rows={3}
      />

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-terracotta text-white font-bold py-2.5 rounded-lg disabled:opacity-50 hover:bg-terracotta-dark transition"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
