'use client';

import React, { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { MapPin, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AddressPage() {
  const [activeTab, setActiveTab] = useState<'pickup' | 'door'>('door');
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Home',
      details: '14b Victoria Island Road, Lagos',
      phone: '+234 800 123 4567',
      isDefault: true
    }
  ]);

  const handleAddNew = () => {
    toast.success('Address form coming soon!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto pb-24">
      <div className="bg-white border-b border-linen-border px-4 pt-4 flex flex-col relative sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center mb-4 relative">
          <BackButton />
          <h1 className="font-bold text-charcoal text-lg">Address Book</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t border-linen-border">
          <button 
            onClick={() => setActiveTab('door')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'door' ? 'text-terracotta border-terracotta' : 'text-charcoal-secondary border-transparent'}`}
          >
            Door Delivery
          </button>
          <button 
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pickup' ? 'text-terracotta border-terracotta' : 'text-charcoal-secondary border-transparent'}`}
          >
            Pickup Station
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'door' && addresses.map(addr => (
          <div key={addr.id} className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <MapPin size={20} className="text-terracotta" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-charcoal">{addr.name}</h3>
                {addr.isDefault && (
                  <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Default
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal-secondary">{addr.details}</p>
              <p className="text-sm text-charcoal-secondary mt-1">{addr.phone}</p>
            </div>
            <button className="text-charcoal-secondary hover:text-terracotta p-2 -mr-2">
              <Edit2 size={16} />
            </button>
          </div>
        ))}

        {activeTab === 'pickup' && (
          <div className="bg-white p-8 rounded-2xl border border-linen-border shadow-sm text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} className="text-warmgrey" />
            </div>
            <p className="text-sm font-bold text-charcoal">No pickup stations saved</p>
            <p className="text-xs text-charcoal-secondary mt-1">Select a nearby station at checkout to save it here.</p>
          </div>
        )}

        {activeTab === 'door' && (
          <button 
            onClick={handleAddNew}
            className="w-full bg-white border border-dashed border-terracotta text-terracotta py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta/5 transition"
          >
            <Plus size={18} />
            ADD NEW ADDRESS
          </button>
        )}
      </div>
    </div>
  );
}
