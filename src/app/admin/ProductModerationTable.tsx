'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Edit2, PackageSearch, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProductAction, updateProductAction } from './actions';

interface ProductItem {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  created_at: string;
  profiles?: {
    name?: string;
  } | null;
  [key: string]: any;
}

export default function ProductModerationTable({
  initialProducts,
}: {
  initialProducts: ProductItem[];
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchFilter, setSearchFilter] = useState('');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.profiles?.name &&
        p.profiles.name.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditPrice(p.price);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditTitle('');
    setEditPrice('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    const parsedPrice = Number(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateProductAction(editingProduct.id, {
        title: editTitle.trim(),
        price: parsedPrice,
      });

      if (res.error) {
        toast.error(`Update failed: ${res.error}`);
      } else {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? { ...item, title: editTitle.trim(), price: parsedPrice }
              : item
          )
        );
        toast.success('Product updated successfully!');
        handleCloseEdit();
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred while updating');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${productTitle}"?`
      )
    ) {
      return;
    }

    setDeletingId(productId);
    try {
      const res = await deleteProductAction(productId);
      if (res.error) {
        toast.error(`Failed to delete product: ${res.error}`);
      } else {
        setProducts((prev) => prev.filter((item) => item.id !== productId));
        toast.success(`"${productTitle}" removed from marketplace.`);
      }
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Product Moderation Table
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Review, edit, and moderate catalog pieces uploaded live via Telegram webhook
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by title or vendor..."
            className="text-xs px-3.5 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 w-full sm:w-56"
          />
          <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg flex-shrink-0">
            {filteredProducts.length} Live
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400 font-bold bg-white">
              <th className="px-6 py-4 font-bold">Image</th>
              <th className="px-6 py-4 font-bold">Title</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold">Vendor Name</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {filteredProducts.map((p) => {
              const vendorName = p.profiles?.name || 'Verified Atelier';

              return (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50/80 transition-colors group"
                >
                  {/* Column 1: Image (thumbnail) */}
                  <td className="px-6 py-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PackageSearch size={18} className="text-neutral-400" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Title */}
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-bold text-neutral-900 line-clamp-2">
                      {p.title}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      ID: {p.id.slice(0, 8)}...
                    </span>
                  </td>

                  {/* Column 3: Price */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-neutral-900 text-sm">
                      ₦{(p.price || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Column 4: Vendor Name */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
                      {vendorName}
                    </span>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Functional Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-neutral-500 hover:text-charcoal p-2 rounded-xl hover:bg-neutral-100 transition shadow-sm border border-neutral-200 bg-white"
                        title="Edit Title & Price"
                        aria-label="Edit product"
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Functional Delete Button */}
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="text-neutral-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition shadow-sm border border-neutral-200 bg-white disabled:opacity-50"
                        title="Delete Product"
                        aria-label="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-sm text-neutral-500"
                >
                  <div className="flex flex-col items-center justify-center opacity-50">
                    <PackageSearch size={32} className="mb-3" />
                    <p>No products matching your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* EDIT PRODUCT MODAL DIALOG */}
      {/* ======================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Edit Product Details
                </h3>
                <p className="text-xs text-neutral-500">
                  Update title or adjust pricing
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Royal Agbada Set with Handcrafted Embroidery"
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                />
              </div>

              {/* Product Price */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Price in Naira (₦) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="flex-1 py-2.5 text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-black rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
