"use client";

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function HubFilters() {
  const [hubs, setHubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHubs = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('vendors').select('location');
      if (data) {
        const uniqueLocations = Array.from(new Set(data.map(v => v.location).filter(Boolean)));
        setHubs(uniqueLocations as string[]);
      }
      setLoading(false);
    };
    fetchHubs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-24 bg-white border border-linen-pillBorder rounded-full animate-pulse shadow-sm" />
        <div className="h-7 w-20 bg-white border border-linen-pillBorder rounded-full animate-pulse shadow-sm" />
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <button className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-terracotta hover:text-white transition">
        <MapPin size={12} className="opacity-70" />
        All Hubs
      </button>
    );
  }

  return (
    <>
      <button className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-terracotta hover:text-white transition">
        <MapPin size={12} className="opacity-70" />
        All Hubs
      </button>
      {hubs.map((hub) => (
        <button key={hub} className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-linen-pillBorder rounded-full px-3 py-1.5 shadow-sm text-[11px] font-semibold text-charcoal hover:bg-terracotta hover:text-white transition">
          {hub}
        </button>
      ))}
    </>
  );
}
