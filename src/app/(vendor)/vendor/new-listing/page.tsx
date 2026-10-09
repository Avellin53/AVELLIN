"use client";

import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

export default function NewListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Fashion',
    price: '',
    bust: '',
    waist: '',
    shoulders: '',
    length: '',
    stock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 }
  });

  const handlePublish = async () => {
    if (!formData.title || !formData.price) {
      toast.error('Please fill out required fields');
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      let image_url = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);
        
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        image_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('products').insert({
        vendor_id: user.id,
        title: formData.title,
        price: parseInt(formData.price),
        category: formData.category,
        image_url,
        biometrics: {
          bust: parseInt(formData.bust) || null,
          waist: parseInt(formData.waist) || null,
          shoulders: parseInt(formData.shoulders) || null,
          length: parseInt(formData.length) || null,
        },
        stock: formData.stock
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Listing published successfully!');
      router.push('/vendor');
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen relative pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 bg-linen/95 backdrop-blur-xl border-b border-linen-border px-5 py-4 z-40 flex items-center gap-4">
        <Link href="/vendor" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={20} className="text-charcoal" />
        </Link>
        <h1 className="font-extrabold text-lg text-charcoal">Create New Listing</h1>
      </div>

      <div className="px-5 pt-6 flex flex-col space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Item Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Architectural Terracotta Blazer" 
              className="w-full bg-white border border-linen-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {['Fashion', 'Beauty', 'Accessories', 'Footwear'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition shadow-sm ${formData.category === cat ? 'bg-terracotta text-white border-terracotta' : 'bg-white border-linen-border text-charcoal hover:bg-linen-surface'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1.5">Price (₦)</label>
            <input 
              type="number" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              placeholder="0.00" 
              className="w-full bg-white border border-linen-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta shadow-sm placeholder:text-warmgrey"
            />
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Media</h2>
              <p className="text-[10px] text-charcoal-secondary">Upload up to 5 high-quality images</p>
            </div>
          </div>
          <div className="relative w-full h-32 border-2 border-dashed border-terracotta/30 bg-terracotta/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-terracotta/10 transition cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-3 bg-white rounded-full shadow-sm">
              <UploadCloud size={20} className="text-terracotta" />
            </div>
            <span className="text-xs font-bold text-terracotta">
              {imageFile ? imageFile.name : "Tap to upload image"}
            </span>
          </div>
        </div>

        {/* AI Biometrics */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Fit & Biometrics Specs (cm)</h2>
              <p className="text-[10px] text-charcoal-secondary">Required for the AI Perfect Fit algorithm</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['bust', 'waist', 'shoulders', 'length'].map(measurement => (
              <div key={measurement}>
                <label className="block text-[10px] font-bold text-warmgrey uppercase tracking-wider mb-1">{measurement}</label>
                <input 
                  type="number" 
                  value={formData[measurement as keyof typeof formData] as string}
                  onChange={e => setFormData({...formData, [measurement]: e.target.value})}
                  placeholder="cm" 
                  className="w-full bg-white border border-linen-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta shadow-sm placeholder:text-warmgrey"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Inventory Stock</h2>
              <p className="text-[10px] text-charcoal-secondary">Set available quantity per size</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {['XS', 'S', 'M', 'L', 'XL'].map(size => (
              <div key={size} className="flex items-center justify-between bg-white border border-linen-border rounded-xl p-3 shadow-sm">
                <span className="font-bold text-charcoal w-8">{size}</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setFormData({...formData, stock: {...formData.stock, [size]: Math.max(0, formData.stock[size as keyof typeof formData.stock] - 1)}})} className="w-8 h-8 rounded-full bg-linen-surface flex items-center justify-center text-charcoal font-bold">-</button>
                  <span className="font-bold text-sm w-4 text-center">{formData.stock[size as keyof typeof formData.stock]}</span>
                  <button onClick={() => setFormData({...formData, stock: {...formData.stock, [size]: formData.stock[size as keyof typeof formData.stock] + 1}})} className="w-8 h-8 rounded-full bg-linen-surface flex items-center justify-center text-charcoal font-bold"><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Action */}
      <div className="fixed bottom-[80px] max-w-[420px] w-full px-5 z-40 pb-2">
        <button 
          onClick={handlePublish}
          disabled={loading}
          className="w-full bg-charcoal text-white text-sm font-bold h-14 rounded-2xl flex items-center justify-center shadow-xl hover:bg-black transition disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish to Marketplace'}
        </button>
      </div>

    </div>
  );
}
