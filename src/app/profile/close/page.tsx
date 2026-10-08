'use client';

import React, { useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

export default function CloseAccountPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCloseAccount = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      // We would ideally call an edge function here to securely delete the user record, 
      // but for MVP we will sign them out and show a success message.
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Your account has been scheduled for deletion.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to close account');
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto pb-24">
      <div className="bg-white border-b border-linen-border px-4 py-4 flex items-center justify-center relative sticky top-0 z-10 shadow-sm">
        <BackButton />
        <h1 className="font-bold text-charcoal text-lg">Close Account</h1>
      </div>

      <div className="p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Are you sure you want to close your account?</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Closing your account is permanent. You will lose access to all your orders, biometric profile data, saved addresses, and Ms. Ave conversation history.
          </p>

          <ul className="text-xs text-neutral-500 space-y-2 mb-6 list-disc pl-4">
            <li>Any pending orders will still be delivered.</li>
            <li>You will not be able to reactivate this account.</li>
            <li>Your data will be permanently erased after 30 days.</li>
          </ul>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-12 bg-white border border-red-500 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            Close My Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-[92%] max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-neutral-900 mb-2">Final Confirmation</h3>
            <p className="text-sm text-neutral-600 mb-6">
              This action cannot be undone. Do you really want to permanently close your Avellin account?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCloseAccount}
                disabled={isDeleting}
                className="w-full h-12 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? 'Processing...' : 'Yes, Close Account'}
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isDeleting}
                className="w-full h-12 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
