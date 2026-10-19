'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Ruler,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Save,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
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

// Clean SVG line-art diagram components for precise atelier tailoring
function ShoulderDiagramSVG() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-24 stroke-terracotta fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Torso & Head silhouette */}
      <circle cx="100" cy="30" r="16" className="stroke-neutral-300" />
      <path d="M92 46 C92 56 108 56 108 46" className="stroke-neutral-300" />
      <path d="M35 75 C45 55 75 52 92 52 L108 52 C125 52 155 55 165 75 L160 110 L40 110 Z" className="stroke-neutral-200 fill-neutral-50" />
      {/* Shoulder measure line */}
      <line x1="42" y1="62" x2="158" y2="62" strokeDasharray="4 3" className="stroke-terracotta" strokeWidth="2.5" />
      {/* Shoulder endpoints indicators */}
      <circle cx="42" cy="62" r="4" className="fill-terracotta stroke-terracotta" />
      <circle cx="158" cy="62" r="4" className="fill-terracotta stroke-terracotta" />
      <text x="100" y="58" textAnchor="middle" className="text-[9px] fill-terracotta font-sans font-bold" stroke="none">
        Shoulder Width
      </text>
    </svg>
  );
}

function BustDiagramSVG() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-24 stroke-terracotta fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Upper Torso */}
      <path d="M40 30 C50 20 80 18 100 18 C120 18 150 20 160 30 L155 110 L45 110 Z" className="stroke-neutral-200 fill-neutral-50" />
      {/* Bust/Chest circumference loop */}
      <ellipse cx="100" cy="60" rx="55" ry="14" strokeDasharray="4 3" className="stroke-terracotta" strokeWidth="2.5" />
      <circle cx="45" cy="60" r="3.5" className="fill-terracotta stroke-terracotta" />
      <circle cx="155" cy="60" r="3.5" className="fill-terracotta stroke-terracotta" />
      <text x="100" y="63" textAnchor="middle" className="text-[9px] fill-terracotta font-sans font-bold" stroke="none">
        Fullest Part of Chest (Parallel to floor)
      </text>
    </svg>
  );
}

function WaistDiagramSVG() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-24 stroke-terracotta fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Hourglass Torso */}
      <path d="M50 15 C60 45 70 55 68 70 C66 85 55 110 50 115 L150 115 C145 110 134 85 132 70 C130 55 140 45 150 15 Z" className="stroke-neutral-200 fill-neutral-50" />
      {/* Belly button indicator */}
      <circle cx="100" cy="80" r="2" className="fill-neutral-400 stroke-none" />
      {/* Waist measurement ring */}
      <ellipse cx="100" cy="65" rx="35" ry="9" strokeDasharray="4 3" className="stroke-terracotta" strokeWidth="2.5" />
      <circle cx="65" cy="65" r="3.5" className="fill-terracotta stroke-terracotta" />
      <circle cx="135" cy="65" r="3.5" className="fill-terracotta stroke-terracotta" />
      <text x="100" y="62" textAnchor="middle" className="text-[9px] fill-terracotta font-sans font-bold" stroke="none">
        Narrowest Point (Above belly button)
      </text>
    </svg>
  );
}

function InseamDiagramSVG() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-24 stroke-terracotta fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Lower Body & Legs */}
      <path d="M60 10 L140 10 L135 110 L115 110 L100 45 L85 110 L65 110 Z" className="stroke-neutral-200 fill-neutral-50" />
      {/* Crotch point to inner ankle */}
      <line x1="97" y1="47" x2="84" y2="108" strokeDasharray="4 3" className="stroke-terracotta" strokeWidth="2.5" />
      <circle cx="97" cy="47" r="3.5" className="fill-terracotta stroke-terracotta" />
      <circle cx="84" cy="108" r="3.5" className="fill-terracotta stroke-terracotta" />
      <text x="50" y="75" textAnchor="middle" className="text-[9px] fill-terracotta font-sans font-bold" stroke="none">
        Inside Leg
      </text>
    </svg>
  );
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

  // Track expanded guide accordion for each measurement field
  const [expandedField, setExpandedField] = useState<string | null>('shoulder');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleAccordion = (field: string) => {
    setExpandedField((prev) => (prev === field ? null : field));
  };

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
          'Your custom-fit measurements will now automatically attach when you order bespoke pieces.',
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
    <div className="flex flex-col min-h-screen bg-linen pb-32 w-full max-w-lg mx-auto">
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
                Visual Tailoring Guide
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
            <span>Interactive Visual Measurement Guide</span>
          </div>
          <p className="text-xs text-charcoal leading-relaxed font-medium">
            Accurate body measurements prevent fit issues. Tap any measurement below to reveal the interactive SVG line-art diagram and precise atelier tailoring instructions.
          </p>
          {isComplete && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>All 5 Biometric Measurements Calibrated</span>
            </div>
          )}
        </div>

        {/* Form with Visual Accordion Guides */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-linen-border shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-warmgrey">
              Body Dimensions ({unit})
            </h2>
            <span className="text-[11px] text-terracotta font-semibold">
              Click diagrams to guide your tape
            </span>
          </div>

          {/* 1. SHOULDER */}
          <div className="border border-linen-border rounded-2xl p-3.5 transition-all bg-linen-surface/40 hover:border-neutral-300">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <span>Shoulder Width</span>
              </label>
              <button
                type="button"
                onClick={() => toggleAccordion('shoulder')}
                className="text-[11px] text-terracotta font-semibold flex items-center gap-1 hover:underline"
              >
                <span>{expandedField === 'shoulder' ? 'Hide Visual' : 'View Visual'}</span>
                {expandedField === 'shoulder' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="shoulder"
                value={formData.shoulder}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 17.5' : 'e.g. 44'}
                className="w-full bg-white border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>

            {/* Precise Instructional Tip */}
            <p className="text-[11px] text-charcoal/80 font-medium mt-1.5 leading-snug">
              💡 <strong>Shoulder:</strong> Measure from the tip of the left shoulder bone across the back curve to the right shoulder bone.
            </p>

            {/* Interactive Accordion SVG Diagram */}
            {expandedField === 'shoulder' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-linen-border flex flex-col items-center animate-in fade-in duration-200">
                <ShoulderDiagramSVG />
                <span className="text-[10px] text-warmgrey font-medium mt-1">
                  Keep arms relaxed at your sides while someone measures across your upper back.
                </span>
              </div>
            )}
          </div>

          {/* 2. BUST / CHEST */}
          <div className="border border-linen-border rounded-2xl p-3.5 transition-all bg-linen-surface/40 hover:border-neutral-300">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <span>Bust / Chest Circumference</span>
              </label>
              <button
                type="button"
                onClick={() => toggleAccordion('bust')}
                className="text-[11px] text-terracotta font-semibold flex items-center gap-1 hover:underline"
              >
                <span>{expandedField === 'bust' ? 'Hide Visual' : 'View Visual'}</span>
                {expandedField === 'bust' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="bust"
                value={formData.bust}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 38' : 'e.g. 96'}
                className="w-full bg-white border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>

            {/* Precise Instructional Tip */}
            <p className="text-[11px] text-charcoal/80 font-medium mt-1.5 leading-snug">
              💡 <strong>Bust/Chest:</strong> Measure around the fullest part of the chest, keeping the tape parallel to the floor.
            </p>

            {/* Interactive Accordion SVG Diagram */}
            {expandedField === 'bust' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-linen-border flex flex-col items-center animate-in fade-in duration-200">
                <BustDiagramSVG />
                <span className="text-[10px] text-warmgrey font-medium mt-1">
                  Do not pull the measuring tape too tight; allow normal breathing room.
                </span>
              </div>
            )}
          </div>

          {/* 3. NATURAL WAIST */}
          <div className="border border-linen-border rounded-2xl p-3.5 transition-all bg-linen-surface/40 hover:border-neutral-300">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <span>Natural Waist</span>
              </label>
              <button
                type="button"
                onClick={() => toggleAccordion('waist')}
                className="text-[11px] text-terracotta font-semibold flex items-center gap-1 hover:underline"
              >
                <span>{expandedField === 'waist' ? 'Hide Visual' : 'View Visual'}</span>
                {expandedField === 'waist' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 32' : 'e.g. 81'}
                className="w-full bg-white border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>

            {/* Precise Instructional Tip */}
            <p className="text-[11px] text-charcoal/80 font-medium mt-1.5 leading-snug">
              💡 <strong>Waist:</strong> Measure around the narrowest point above your belly button.
            </p>

            {/* Interactive Accordion SVG Diagram */}
            {expandedField === 'waist' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-linen-border flex flex-col items-center animate-in fade-in duration-200">
                <WaistDiagramSVG />
                <span className="text-[10px] text-warmgrey font-medium mt-1">
                  Bend slightly to one side to find your natural torso crease; that is your natural waist.
                </span>
              </div>
            )}
          </div>

          {/* 4. INSEAM */}
          <div className="border border-linen-border rounded-2xl p-3.5 transition-all bg-linen-surface/40 hover:border-neutral-300">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                <span>Inseam (Trouser Length)</span>
              </label>
              <button
                type="button"
                onClick={() => toggleAccordion('inseam')}
                className="text-[11px] text-terracotta font-semibold flex items-center gap-1 hover:underline"
              >
                <span>{expandedField === 'inseam' ? 'Hide Visual' : 'View Visual'}</span>
                {expandedField === 'inseam' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="inseam"
                value={formData.inseam}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 31' : 'e.g. 78'}
                className="w-full bg-white border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>

            {/* Precise Instructional Tip */}
            <p className="text-[11px] text-charcoal/80 font-medium mt-1.5 leading-snug">
              💡 <strong>Inseam:</strong> Measure from the crotch seam straight down the inside leg to the ankle bone.
            </p>

            {/* Interactive Accordion SVG Diagram */}
            {expandedField === 'inseam' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-linen-border flex flex-col items-center animate-in fade-in duration-200">
                <InseamDiagramSVG />
                <span className="text-[10px] text-warmgrey font-medium mt-1">
                  Stand upright without shoes, feet shoulder-width apart for trouser hem accuracy.
                </span>
              </div>
            )}
          </div>

          {/* 5. TOTAL HEIGHT */}
          <div className="border border-linen-border rounded-2xl p-3.5 transition-all bg-linen-surface/40 hover:border-neutral-300">
            <label className="block text-xs font-bold text-charcoal mb-1.5">
              Total Height
            </label>
            <div className="relative">
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={unit === 'inches' ? 'e.g. 68 (or 5ft 8in)' : 'e.g. 175'}
                className="w-full bg-white border border-linen-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-terracotta"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-warmgrey font-semibold">
                {unit}
              </span>
            </div>
            <p className="text-[11px] text-charcoal/80 font-medium mt-1.5">
              Stand flat against a wall barefoot from floor to top of head.
            </p>
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
              Preview: Vendor WhatsApp & Atelier Attachment
            </p>
            <div className="p-3 bg-linen-surface rounded-xl font-mono text-[11px] text-charcoal border border-linen-border leading-relaxed">
              "Here is my Size Passport for custom native fitting: Shoulder: {formData.shoulder} {unit}, Bust: {formData.bust} {unit}, Waist: {formData.waist} {unit}, Inseam: {formData.inseam} {unit}, Height: {formData.height} {unit}."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
