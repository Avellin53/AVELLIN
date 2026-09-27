"use client";

import React, { useState } from 'react';
import { Search, Package, MapPin, ArrowRight } from 'lucide-react';

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState('All');

  const orders = [
    {
      id: '#AV-8504',
      time: 'Placed today • 10:15 AM',
      status: 'Awaiting Dispatch',
      title: 'Architectural Terracotta Blazer',
      size: 'M',
      price: '₦145,000',
      hub: 'Victoria Island, Lagos',
      note: 'Packaging verified • Pickup window 2:00 PM'
    },
    {
      id: '#AV-8503',
      time: 'Placed yesterday • 4:30 PM',
      status: 'Awaiting Dispatch',
      title: 'Silk Wrap Midi Dress',
      size: 'S',
      price: '₦89,000',
      hub: 'Ikoyi, Lagos',
      note: 'Packaging verified • Pickup window 2:00 PM'
    },
    {
      id: '#AV-8499',
      time: 'Placed 2 days ago',
      status: 'In Transit',
      title: 'Handwoven Rafia Tote',
      size: 'One Size',
      price: '₦45,000',
      hub: 'East Legon, Accra',
      note: 'Handed over to courier'
    }
  ];

  const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="px-5 pt-8 flex flex-col space-y-6">
      {/* 1. Header & Search */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">Orders & Dispatch</h1>
          <span className="px-2.5 py-1 bg-terracotta text-white rounded-full text-[10px] font-bold shadow-sm">4 Active</span>
        </div>
        
        <div className="relative flex items-center w-full">
          <div className="absolute left-3">
            <Search size={18} className="text-warmgrey" />
          </div>
          <input 
            type="text" 
            placeholder="Search Order ID or garment..." 
            className="w-full bg-white border border-linen-border rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey"
          />
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-5 px-5">
        {['All', 'Awaiting Dispatch', 'In Transit', 'Delivered'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition shadow-sm border ${activeTab === tab ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-linen-border text-charcoal hover:bg-linen-surface'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Dispatch Order Cards */}
      <div className="space-y-4 pb-8">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-3xl border border-linen-border p-4 shadow-sm flex flex-col gap-4">
            
            <div className="flex justify-between items-start border-b border-linen-border pb-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-charcoal">{order.id}</span>
                <span className="text-[10px] text-charcoal-secondary">{order.time}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-bold whitespace-nowrap ${order.status === 'Awaiting Dispatch' ? 'bg-ochre/15 text-ochre border border-ochre/20' : 'bg-charcoal/5 text-charcoal border border-charcoal/10'}`}>
                {order.status}
              </span>
            </div>

            <div className="flex gap-3">
              <div className="w-16 h-20 bg-linen-sand rounded-xl shrink-0"></div>
              <div className="flex flex-col flex-1">
                <h3 className="text-xs font-bold text-charcoal line-clamp-1">{order.title}</h3>
                <span className="text-[10px] text-charcoal-secondary mt-0.5">Size: {order.size}</span>
                <span className="text-sm font-extrabold text-charcoal mt-1">{order.price}</span>
                <div className="flex items-center gap-1 mt-auto">
                  <MapPin size={10} className="text-terracotta" />
                  <span className="text-[10px] font-semibold text-charcoal">{order.hub}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-linen-surface p-2.5 rounded-xl border border-linen-border">
              <Package size={14} className="text-warmgrey shrink-0" />
              <span className="text-[10px] text-charcoal-secondary">{order.note}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button className="flex-1 h-10 rounded-xl border border-linen-border text-[11px] font-bold text-charcoal hover:bg-linen-surface transition flex items-center justify-center">
                Packing Slip
              </button>
              {order.status === 'Awaiting Dispatch' ? (
                <button className="flex-[1.5] h-10 rounded-xl bg-terracotta text-white text-[11px] font-bold shadow-md shadow-terracotta/20 hover:bg-terracotta-dark transition flex items-center justify-center gap-1.5">
                  Confirm Dispatch
                  <ArrowRight size={12} />
                </button>
              ) : (
                <button className="flex-[1.5] h-10 rounded-xl bg-charcoal text-white text-[11px] font-bold shadow-sm hover:bg-black transition flex items-center justify-center">
                  Track Courier
                </button>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
