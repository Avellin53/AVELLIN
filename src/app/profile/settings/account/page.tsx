'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Save,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccountManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Password Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load User Data
  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login?redirect=/profile/settings/account');
          return;
        }

        setEmail(user.email || '');

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setName(profile.name || user.user_metadata?.name || '');
          setPhone(profile.phone || user.phone || '');
        } else {
          setName(user.user_metadata?.name || '');
          setPhone(user.phone || '');
        }
      } catch (err) {
        console.error('Error loading account data:', err);
        toast.error('Could not load account details');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  // Handle Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Session expired. Please sign in again.');
        router.push('/login');
        return;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          phone: phone.trim(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { name: name.trim(), phone: phone.trim() },
      });

      toast.success('Account profile updated successfully');
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err?.message || 'Failed to update profile details');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password changed successfully', {
        description: 'Your security credentials have been updated.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.');
      return;
    }

    setDeletingAccount(true);

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Your account has been permanently deleted.');
      router.push('/register');
    } catch (err: any) {
      console.error('Account deletion error:', err);
      toast.error(err?.message || 'Failed to delete account');
      setDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-warmgrey">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto pb-32">
      {/* Top Navigation */}
      <div className="bg-white border-b border-linen-border px-4 py-4 flex items-center justify-center relative sticky top-0 z-20 shadow-xs">
        <BackButton />
        <h1 className="font-extrabold text-charcoal text-base sm:text-lg">
          Account Management
        </h1>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-linen-border shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-linen-border">
            <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal">Profile Details</h2>
              <p className="text-[11px] text-warmgrey">
                Your personal contact information on AVELLIN
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmgrey">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Bello"
                  className="w-full bg-linen-surface/50 border border-linen-border rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta transition shadow-xs"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmgrey">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full bg-linen-surface/50 border border-linen-border rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta transition shadow-xs"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-charcoal">
                  Email Address
                </label>
                <span className="text-[10px] font-semibold text-warmgrey bg-neutral-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Read-only
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmgrey">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-neutral-500 cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-warmgrey mt-1">
                Your email is tied to Supabase Auth for identity verification and cannot be changed here.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full h-11 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section 2: Security & Password Change */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-linen-border shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-linen-border">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal">Security & Password</h2>
              <p className="text-[11px] text-warmgrey">
                Update your account authentication credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                New Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmgrey">
                  <Lock size={16} />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-linen-surface/50 border border-linen-border rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-warmgrey hover:text-charcoal transition"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-warmgrey">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-linen-surface/50 border border-linen-border rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-warmgrey hover:text-charcoal transition"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="w-full h-11 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {updatingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section 3: Danger Zone */}
        <div className="bg-red-50/40 rounded-3xl p-5 sm:p-6 border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-900">Danger Zone</h2>
              <p className="text-[11px] text-red-700">
                Irreversible account actions
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Deleting your account is permanent. All your order history, bespoke biometric passport data, saved addresses, and follows will be wiped.
          </p>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full h-11 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Trash2 size={15} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-red-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-extrabold text-neutral-900 mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              This action cannot be reversed. This will permanently delete your account, authentication access, and all associated personal records.
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                Type <span className="font-mono text-red-600 font-extrabold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl py-2.5 px-3 text-xs font-mono font-bold uppercase text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {deletingAccount ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Permanently Delete My Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText('');
                }}
                disabled={deletingAccount}
                className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition cursor-pointer"
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
