'use client';

import React, { useState, useRef } from 'react';
import { Star, Video, X, UploadCloud, Send, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { submitReviewAction } from '@/app/actions/reviews';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (newReview: any) => void;
  currentUser: { id: string; email?: string } | null;
  onRequireAuth: () => void;
}

export default function ReviewForm({
  productId,
  onReviewSubmitted,
  currentUser,
  onRequireAuth,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File Size check: 15MB maximum
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('Video file is too large', {
        description: 'Please upload a video under 15MB (approx 10 seconds).',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Video Duration check: max ~10 seconds
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 11) {
        toast.error('Video too long', {
          description: `Video duration is ${Math.round(video.duration)}s. Maximum allowed is 10 seconds.`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      toast.success('Video attached successfully (10s max fit review)');
    };
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please enter your review feedback.');
      return;
    }

    if (!currentUser?.id) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    let uploadedPublicUrl: string | null = null;

    try {
      // If a video file was selected, upload it to the 'review-videos' Supabase bucket
      if (videoFile) {
        setUploadProgress('Uploading video review...');
        const supabase = createClient();
        const fileExt = videoFile.name.split('.').pop() || 'mp4';
        const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('review-videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast.error('Could not upload video: ' + uploadError.message);
          setIsSubmitting(false);
          setUploadProgress('');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('review-videos')
          .getPublicUrl(fileName);

        uploadedPublicUrl = urlData.publicUrl;
      }

      setUploadProgress('Publishing verified review...');
      const result = await submitReviewAction({
        productId,
        rating,
        comment: comment.trim(),
        videoUrl: uploadedPublicUrl,
      });

      if (!result.success || !result.review) {
        toast.error(result.error || 'Failed to submit review. Please try again.');
        return;
      }

      onReviewSubmitted(result.review);
      setComment('');
      setRating(5);
      removeVideo();

      toast.success('🎉 Verified Review Published!', {
        description: uploadedPublicUrl
          ? 'Your video review is now live for all prospective buyers.'
          : 'Thank you for rating this bespoke artisan garment.',
      });
    } catch (err: any) {
      console.error('Review submit exception:', err);
      toast.error(err?.message || 'Failed to publish review.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-linen-surface/70 rounded-2xl p-4 border border-linen-border space-y-3.5 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
          Write a Verified Review
        </h4>
        <span className="text-[10px] text-warmgrey">Video clips max 15MB / 10s</span>
      </div>

      {/* 5-Star Rating Selector */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-neutral-500 font-medium mr-1">Your Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
            aria-label={`Rate ${star} star`}
          >
            <Star
              size={20}
              fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-charcoal ml-2">{rating} / 5</span>
      </div>

      {/* Textarea for review comment */}
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the fit accuracy, textile drape, stitching, and craftsmanship?..."
        className="w-full bg-white border border-linen-border rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition shadow-xs resize-none"
      />

      {/* Optional Video Upload Section */}
      <div className="pt-1">
        {!videoPreviewUrl ? (
          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-linen-border rounded-xl cursor-pointer hover:border-terracotta hover:bg-terracotta/5 transition text-xs font-semibold text-charcoal w-fit">
            <Video size={16} className="text-terracotta" />
            <span>Add Video Review (15MB / 10s max)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-start gap-3 bg-white p-2.5 rounded-xl border border-linen-border">
            <video
              src={videoPreviewUrl}
              className="w-20 h-28 rounded-lg object-cover bg-black"
              controls
              playsInline
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
              <div>
                <span className="text-xs font-bold text-charcoal block truncate">
                  {videoFile?.name}
                </span>
                <span className="text-[10px] text-warmgrey">
                  {videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) : 0} MB • Ready to upload
                </span>
              </div>
              <button
                type="button"
                onClick={removeVideo}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition"
              >
                <X size={13} />
                <span>Remove Video</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="w-full h-11 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
      >
        <Send size={14} />
        <span>
          {isSubmitting
            ? uploadProgress || 'Submitting...'
            : 'Submit Verified Review'}
        </span>
      </button>
    </form>
  );
}
