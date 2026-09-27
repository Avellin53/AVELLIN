import React from 'react';
import { ArrowDownLeft, Building2, CheckCircle2, Download } from 'lucide-react';

export default function VendorPayouts() {
  const payouts = [
    { date: 'Oct 24, 2026', amount: '₦245,000', status: 'Completed' },
    { date: 'Oct 17, 2026', amount: '₦182,500', status: 'Completed' },
    { date: 'Oct 10, 2026', amount: '₦310,000', status: 'Completed' },
  ];

  return (
    <div className="px-5 pt-8 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">Payouts</h1>
      </div>

      {/* 1. Balance Card */}
      <div className="bg-white rounded-3xl border border-linen-border p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-green-500"></div>
        <span className="text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-2 mt-2">Available to Payout</span>
        <h2 className="text-4xl font-extrabold text-charcoal tracking-tighter mb-1">₦512,000</h2>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[9px] font-bold mb-4">Cleared funds</span>
        
        <p className="text-[11px] text-charcoal-secondary max-w-[220px] leading-relaxed mb-6">
          Your next automatic transfer to your linked commercial bank account is scheduled for <strong>Oct 31</strong>.
        </p>

        <div className="w-full grid grid-cols-2 gap-3 pt-5 border-t border-linen-border">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-warmgrey uppercase">Pending Clearance</span>
            <span className="text-sm font-extrabold text-charcoal mt-0.5">₦128,500</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-warmgrey uppercase">Monthly Total</span>
            <span className="text-sm font-extrabold text-charcoal mt-0.5">₦1,420,000</span>
          </div>
        </div>
      </div>

      {/* 2. Payout Destination */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-charcoal px-1">Payout Destination</h3>
        <div className="bg-white rounded-2xl border border-linen-border p-4 shadow-sm flex items-center justify-between hover:border-terracotta/30 transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linen-surface rounded-full flex items-center justify-center">
              <Building2 size={18} className="text-warmgrey" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-charcoal">Guaranty Trust Bank</span>
              <span className="text-[11px] font-medium text-charcoal-secondary font-mono mt-0.5">•••• 4821</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-bold">Active</span>
        </div>
      </div>

      {/* 3. Payout History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-charcoal px-1">Recent Settlements</h3>
        <div className="bg-white rounded-3xl border border-linen-border p-2 shadow-sm">
          {payouts.map((payout, i) => (
            <div key={i} className={`flex items-center justify-between p-3 ${i !== payouts.length - 1 ? 'border-b border-linen-border' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                  <ArrowDownLeft size={14} className="text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-charcoal">{payout.amount}</span>
                  <span className="text-[10px] text-charcoal-secondary mt-0.5">{payout.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={12} />
                <span className="text-[10px] font-bold">Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Export */}
      <div className="pt-4 pb-8 flex justify-center">
        <button className="flex items-center gap-1.5 text-xs font-bold text-terracotta hover:text-terracotta-dark transition">
          <Download size={14} />
          Download Tax & Settlement Summary (PDF)
        </button>
      </div>

    </div>
  );
}
