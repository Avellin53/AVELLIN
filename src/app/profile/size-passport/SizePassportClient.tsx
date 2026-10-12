'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ruler, Sparkles, CheckCircle2, ChevronLeft, Save } from 'lucide-react';
import { saveSizePassport } from '@/app/actions/profile';

interface SizePassportData {
  shoulder?: string;
  bust?: string;
  waist?: string;
  inseam?: string;
  height?: string;
  unit?: string;
  updated_at?: string;
}

export default function SizePassportClient({
  initialData,
}: {
  initialData: SizePassportData | null;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<string>(initialData?.unit || 'inches');
  const [formData, setFormData] = useState({
    shoulder: initialData?.shoulder || '',
    bust: initialData?.bust || '',
    waist: initialData?.waist || '',
    inseam: initialData?.inseam || '',
    height: initialData?.height || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSavedSuccess(false);

    try {
      const res = await saveSizePassport({
        ...formData,
        unit,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to update Size Passport');
      }

      setSavedSuccess(true);
      toast.success('Size Passport saved successfully!', {
        description:
          'Your bespoke measurements will now automatically attach when you message ateliers.',
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error saving measurements');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete =
    formData.shoulder &&
    formData.bust &&
    formData.waist &&
    formData.inseam &&
    formData.height;

  return (
    <div className="flex flex-col min-h-screen bg-linen pb-32 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-linen-border sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition text-charcoal"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Ruler size={18} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-charcoal">Size Passport</h1>
              <p className="text-[10px] text-warmgrey uppercase tracking-wider font-bold">
                Bespoke Measurement Hub
              </p>
            </div>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex bg-linen-surface p-1 rounded-xl border border-linen-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setUnit('inches')}
            className={`px-2.5 py-1 rounded-lg transition ${
              unit === 'inches'
                ? 'bg-white text-charcoal shadow-xs'
                : 'text-warmgrey hover:text-charcoal'
            }`}
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-2.5 py-1 rounded-lg transition ${
              unit === 'cm'
                ? 'bg-white text-charcoal shadow-xs'
                : 'text-warmgrey hover:text-charcoal'
            }`}
          >
            CM
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Value Proposition Card */}
        <div className="bg-gradient-to-br from-white to-linen-surface p-4 rounded-2xl border border-linen-border shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-terracotta text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>African Bespoke Tailoring Standard</span>
          </div>
          <p className="text-xs text-charcoal leading-relaxed font-medium">
            Save your anatomical measurements once. Whenever you message a verified Nigerian or regional atelier on WhatsApp or email, AVELLIN automatically appends your exact passport for custom native fittings.
          </p>
          {isComplete && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>Passport Ready for Ateliers</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-linen-border shadow-sm space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-warmgrey">
            Personal Measurements ({unit})
          </h2>

          {/* Shoulder */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Shoulder Width
            </label>
            <div className="relative">
              <input
                type="text"
                name="shoulder"
                value={formData.shoulder}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 17.5' : 'e.g. 44'}
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[10px] text-warmgrey mt-1">Across top of back from bone to bone</p>
          </div>

          {/* Bust / Chest */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Bust / Chest Circumference
            </label>
            <div className="relative">
              <input
                type="text"
                name="bust"
                value={formData.bust}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 38' : 'e.g. 96'}
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[10px] text-warmgrey mt-1">Around the fullest part of the chest</p>
          </div>

          {/* Waist */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Natural Waist
            </label>
            <div className="relative">
              <input
                type="text"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 32' : 'e.g. 81'}
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[10px] text-warmgrey mt-1">Around narrowest point above belly button</p>
          </div>

          {/* Inseam */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Inseam (Trouser Length)
            </label>
            <div className="relative">
              <input
                type="text"
                name="inseam"
                value={formData.inseam}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 31' : 'e.g. 78'}
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[10px] text-warmgrey mt-1">From crotch seam down inside leg to ankle</p>
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">
              Total Height
            </label>
            <div className="relative">
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 68 (or 5ft 8in)' : 'e.g. 175'}
                className="w-full bg-linen-surface border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[10px] text-warmgrey mt-1">Full barefoot standing height</p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md hover:bg-black transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Saving to Database...' : 'Save Size Passport'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview of Attached Message */}
        {isComplete && (
          <div className="bg-white rounded-2xl p-4 border border-linen-border space-y-2 text-xs">
            <p className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider">
              Preview: Vendor WhatsApp & Email Attachment
            </p>
            <div className="p-3 bg-linen-surface rounded-xl font-mono text-[11px] text-charcoal border border-linen-border leading-relaxed">
              "Here is my Size Passport for a bespoke fit: Shoulder: {formData.shoulder} {unit}, Bust: {formData.bust} {unit}, Waist: {formData.waist} {unit}, Inseam: {formData.inseam} {unit}, Height: {formData.height} {unit}."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
