'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function UploadForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('products').insert({
        title: name,
        description,
        price: parseFloat(price),
        category,
        image_url: imageUrl || null,
        vendor_id: user.id
      });

      if (error) throw error;

      toast.success('Listing published!');
      router.push('/vendor/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish listing');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">Product Name</label>
        <input 
          type="text" 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Kente Maxi Dress"
          className="w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">Description</label>
        <textarea 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your piece..."
          className="w-full h-24 bg-white border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">Price (NGN)</label>
        <input 
          type="number" 
          required
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm appearance-none"
        >
          <option value="Fashion">Fashion</option>
          <option value="Beauty">Beauty</option>
          <option value="Accessories">Accessories</option>
          <option value="Footwear">Footwear</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">Image URL (MVP)</label>
        <input 
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full h-12 bg-white border border-neutral-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-sm"
        />
        <p className="text-[10px] text-neutral-400 mt-1">Paste a direct image link for this iteration.</p>
      </div>

      <div className="mt-6">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 bg-neutral-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </div>
    </form>
  );
}
