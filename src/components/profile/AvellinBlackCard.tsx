'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2, ChevronRight, Gift } from 'lucide-react';

interface AvellinBlackCardProps {
  loyaltyPoints?: number;
  vipTier?: string;
  userName?: string;
}

export default function AvellinBlackCard({
  loyaltyPoints = 0,
  vipTier = 'Member',
  userName = 'Valued Client',
}: AvellinBlackCardProps) {
  const points = loyaltyPoints || 0;
  const targetPoints = 10000;
  const progressPercent = Math.min(Math.round((points / targetPoints) * 100), 100);
  const isBlackVip = points >= targetPoints || vipTier.toLowerCase().includes('black') || vipTier.toLowerCase().includes('vip');

  return (
    <div className="w-full">
      {isBlackVip ? (
        /* ======================================================== */
        /* SLEEK BLACK GRADIENT CARD: AVELLIN BLACK VIP */
        /* ======================================================== */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-6 text-white shadow-2xl border border-neutral-700/60 group">
          {/* Subtle gold luxury glow & watermark */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Crown size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-amber-300 uppercase">
                    AVELLIN BLACK VIP
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    Permanent Haute Tier
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400 text-neutral-950 shadow-sm">
                Active Tier
              </span>
            </div>

            {/* Middle: Member name and Points */}
            <div className="pt-2 flex justify-between items-end border-b border-neutral-800 pb-4">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Cardholder
                </p>
                <p className="text-sm font-extrabold tracking-wide text-neutral-100">
                  {userName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Luxury Rewards
                </p>
                <p className="text-lg font-black text-amber-300 font-mono">
                  {points.toLocaleString()} <span className="text-[10px] text-neutral-400">PTS</span>
                </p>
              </div>
            </div>

            {/* Active VIP Perks */}
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Active VIP Perks Applied:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700/50 text-[11px] font-semibold text-neutral-200">
                  <CheckCircle2 size={13} className="text-amber-400 flex-shrink-0" />
                  <span>Free GIGL Delivery Applied</span>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700/50 text-[11px] font-semibold text-neutral-200">
                  <CheckCircle2 size={13} className="text-amber-400 flex-shrink-0" />
                  <span>Priority Atelier Queue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* STANDARD TIER CARD WITH PROGRESS TO BLACK VIP */
        /* ======================================================== */
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 border border-linen-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
                <Crown size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide text-neutral-900 uppercase">
                  Avellin Rewards • {vipTier}
                </h3>
                <p className="text-[11px] text-warmgrey">
                  Earn points on bespoke tailoring & drops
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-black text-neutral-900 font-mono">
                {points.toLocaleString()}
              </span>
              <span className="text-[10px] text-warmgrey font-semibold block">
                / 10,000 PTS
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-neutral-700">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-terracotta" />
                <span>Road to AVELLIN BLACK VIP</span>
              </span>
              <span className="font-mono text-terracotta">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-linen-surface rounded-full overflow-hidden border border-linen-border">
              <div
                className="h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-terracotta rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Next Tier Incentive */}
          <div className="flex items-center justify-between p-3 bg-linen-surface rounded-2xl border border-linen-border text-xs">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-terracotta" />
              <span className="font-medium text-neutral-700">
                Unlock <strong className="font-extrabold text-neutral-900">Free GIGL Delivery</strong> & Bespoke Priority at 10,000 points.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
