'use client'

import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createVendor } from './actions'

export default function VendorCreationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await createVendor(formData)
    
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Vendor registered successfully!')
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-bold text-sm rounded-xl hover:bg-black transition shadow-sm w-full sm:w-auto"
      >
        <Plus size={16} />
        Register New Vendor
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-[92%] max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">New Vendor</h2>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Vendor / Brand Name</label>
                <input required name="brandName" type="text" className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-sm focus:border-neutral-400 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <input required name="email" type="email" className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-sm focus:border-neutral-400 outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Temporary Password</label>
                <input required name="password" type="password" className="w-full h-12 bg-neutral-50 border border-neutral-200 rounded-xl px-4 text-sm focus:border-neutral-400 outline-none transition" />
              </div>
              
              <div className="pt-2">
                <button disabled={loading} type="submit" className="w-full h-12 bg-neutral-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50">
                  {loading ? 'Registering...' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
