'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  User,
  Home,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja FCT',
  'Rivers',
  'Edo',
  'Oyo',
  'Kano',
  'Anambra',
  'Ogun',
  'Delta',
  'Enugu',
  'Kaduna',
  'Ondo',
  'Kwara',
  'Abia',
  'Akwa Ibom',
  'Imo',
  'Plateau',
  'Osun',
  'Cross River',
  'Bayelsa',
  'Benue',
  'Borno',
  'Ebonyi',
  'Ekiti',
  'Gombe',
  'Jigawa',
  'Kebbi',
  'Kogi',
  'Katsina',
  'Nasarawa',
  'Niger',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
  'Bauchi',
  'Adamawa',
];

const DEFAULT_INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-default-1',
    fullName: 'Oluwaseun Adeleke',
    phone: '+234 803 123 4567',
    streetAddress: '14b Victoria Island Road, Oniru',
    city: 'Victoria Island',
    state: 'Lagos',
    isDefault: true,
  },
];

export default function AddressPage() {
  const [activeTab, setActiveTab] = useState<'door' | 'pickup'>('door');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load addresses from localStorage or Supabase
  useEffect(() => {
    setMounted(true);
    const loadAddresses = async () => {
      let loaded: Address[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('avellin_saved_addresses');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed;
            }
          } catch (e) {
            console.error('Error parsing stored addresses:', e);
          }
        }
      }

      // If user is logged in, try checking Supabase profile
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('addresses')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
            loaded = profile.addresses;
          }
        }
      } catch (err) {
        console.error('Error loading addresses from Supabase:', err);
      }

      if (loaded.length === 0) {
        loaded = DEFAULT_INITIAL_ADDRESSES;
      }
      setAddresses(loaded);
    };

    loadAddresses();
  }, []);

  // Sync helper
  const syncAddresses = async (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    if (typeof window !== 'undefined') {
      localStorage.setItem('avellin_saved_addresses', JSON.stringify(newAddresses));
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ addresses: newAddresses })
          .eq('id', user.id);
      }
    } catch (e) {
      console.error('Failed to sync addresses to profile:', e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFullName('');
    setPhone('+234 ');
    setStreetAddress('');
    setCity('');
    setState('Lagos');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setState(addr.state || 'Lagos');
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    await syncAddresses(updated);
    toast.success('Address removed');
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await syncAddresses(updated);
    toast.success('Default address updated');
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !streetAddress.trim() || !city.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      let updatedAddresses: Address[] = [];

      if (editingAddressId) {
        updatedAddresses = addresses.map((addr) => {
          if (addr.id === editingAddressId) {
            return {
              ...addr,
              fullName: fullName.trim(),
              phone: phone.trim(),
              streetAddress: streetAddress.trim(),
              city: city.trim(),
              state,
              isDefault,
            };
          }
          return isDefault ? { ...addr, isDefault: false } : addr;
        });
        toast.success('Address updated successfully');
      } else {
        const newAddress: Address = {
          id: `addr-${Date.now()}`,
          fullName: fullName.trim(),
          phone: phone.trim(),
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          state,
          isDefault,
        };

        if (isDefault || addresses.length === 0) {
          updatedAddresses = [
            { ...newAddress, isDefault: true },
            ...addresses.map((a) => ({ ...a, isDefault: false })),
          ];
        } else {
          updatedAddresses = [...addresses, newAddress];
        }
        toast.success('New delivery address saved');
      }

      await syncAddresses(updatedAddresses);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto pb-24 relative">
      <div className="bg-white border-b border-linen-border px-4 pt-4 flex flex-col relative sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-center mb-4 relative">
          <BackButton />
          <h1 className="font-bold text-charcoal text-lg">Address Book</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-linen-border">
          <button
            onClick={() => setActiveTab('door')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'door'
                ? 'text-terracotta border-terracotta'
                : 'text-charcoal-secondary border-transparent'
            }`}
          >
            Door Delivery
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'pickup'
                ? 'text-terracotta border-terracotta'
                : 'text-charcoal-secondary border-transparent'
            }`}
          >
            Pickup Station
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'door' && (
          <>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-4 rounded-2xl border border-linen-border shadow-sm flex items-start gap-3 relative transition hover:border-terracotta/40"
              >
                <div className="mt-1 flex-shrink-0">
                  <MapPin size={20} className="text-terracotta" />
                </div>
                <div className="flex-1 pr-14">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-charcoal text-sm">{addr.fullName}</h3>
                    {addr.isDefault ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={10} /> Default Delivery
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[10px] text-terracotta hover:underline font-semibold"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed">
                    {addr.streetAddress}, {addr.city}, {addr.state} State
                  </p>
                  <p className="text-xs text-warmgrey mt-1 font-medium">{addr.phone}</p>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="text-neutral-400 hover:text-charcoal p-1.5 rounded-lg hover:bg-neutral-100 transition"
                    title="Edit address"
                    aria-label="Edit address"
                  >
                    <Edit2 size={15} />
                  </button>
                  {addresses.length > 1 && (
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-neutral-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-neutral-100 transition"
                      title="Delete address"
                      aria-label="Delete address"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Address Button */}
            <button
              onClick={handleOpenAddModal}
              className="w-full bg-white border border-dashed border-terracotta text-terracotta py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-terracotta/5 transition shadow-sm"
            >
              <Plus size={18} />
              <span>ADD NEW ADDRESS</span>
            </button>
          </>
        )}

        {activeTab === 'pickup' && (
          <div className="bg-white p-8 rounded-2xl border border-linen-border shadow-sm text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} className="text-warmgrey" />
            </div>
            <p className="text-sm font-bold text-charcoal">No pickup stations saved</p>
            <p className="text-xs text-charcoal-secondary mt-1">
              Select a designated courier pickup point at checkout to save it here.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SLIDE-OVER / MODAL DRAWER FOR ADD / EDIT ADDRESS */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-linen-border mb-4">
              <h2 className="text-lg font-bold text-charcoal">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-charcoal rounded-full hover:bg-neutral-100 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSubmitAddress} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-warmgrey" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chimamanda Ngozi"
                    className="w-full bg-linen-surface border border-linen-border rounded-xl py-3 pl-10 pr-4 text-xs text-charcoal focus:outline-none focus:border-terracotta transition"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Phone Number (Nigeria) *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-warmgrey" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 123 4567"
                    className="w-full bg-linen-surface border border-linen-border rounded-xl py-3 pl-10 pr-4 text-xs text-charcoal focus:outline-none focus:border-terracotta transition"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Street Address *
                </label>
                <div className="relative">
                  <Home size={16} className="absolute left-3.5 top-3.5 text-warmgrey" />
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
                    className="w-full bg-linen-surface border border-linen-border rounded-xl py-3 pl-10 pr-4 text-xs text-charcoal focus:outline-none focus:border-terracotta transition"
                  />
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ikeja"
                    className="w-full bg-linen-surface border border-linen-border rounded-xl py-3 px-3.5 text-xs text-charcoal focus:outline-none focus:border-terracotta transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-linen-surface border border-linen-border rounded-xl py-3 px-3.5 text-xs text-charcoal focus:outline-none focus:border-terracotta transition"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox: Default Delivery Address */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="setDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-terracotta focus:ring-terracotta border-neutral-300"
                />
                <label
                  htmlFor="setDefaultCheckbox"
                  className="text-xs text-charcoal font-medium cursor-pointer"
                >
                  Set as Default Delivery Address
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-linen-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-charcoal font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
