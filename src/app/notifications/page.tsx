'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '@/components/ui/BackButton';
import { createClient } from '@/utils/supabase/client';
import {
  Bell,
  ShieldCheck,
  Package,
  Sparkles,
  Check,
  CheckCheck,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setNotifications([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback default welcome notification if table isn't created yet
        setNotifications([
          {
            id: 'welcome-seed',
            user_id: user.id,
            message: 'Welcome to AVELLIN! Your account is secure and ready for shopping.',
            type: 'welcome',
            read: false,
            created_at: new Date().toISOString(),
          },
        ]);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        const welcomeSeed = {
          user_id: user.id,
          message: 'Welcome to AVELLIN! Your account is secure and ready for shopping.',
          type: 'welcome',
          read: false,
          created_at: new Date().toISOString(),
        };

        const { data: newSeed } = await supabase
          .from('notifications')
          .insert(welcomeSeed)
          .select()
          .single();

        setNotifications(newSeed ? [newSeed] : [{ ...welcomeSeed, id: 'temp' }]);
      } else {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!userId) return;
    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const supabase = createClient();
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (err) {
      console.warn('Error marking as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'welcome':
      case 'security':
        return <ShieldCheck size={18} className="text-emerald-600" />;
      case 'order':
        return <Package size={18} className="text-terracotta" />;
      default:
        return <Sparkles size={18} className="text-ochre" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-linen w-full max-w-md md:max-w-2xl mx-auto pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-linen-border px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-extrabold text-charcoal text-lg">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-terracotta hover:underline flex items-center gap-1 bg-terracotta/5 px-2.5 py-1.5 rounded-lg border border-terracotta/20 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {!userId ? (
          <div className="bg-white rounded-3xl p-8 border border-linen-border text-center flex flex-col items-center mt-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-linen-surface flex items-center justify-center text-warmgrey mb-3">
              <Bell size={26} />
            </div>
            <h2 className="text-base font-bold text-charcoal">Sign in to view notifications</h2>
            <p className="text-xs text-warmgrey max-w-xs mt-1 mb-5">
              Access your personalized order dispatches, vendor messages, and security notifications.
            </p>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-black transition"
            >
              Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-warmgrey text-xs">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-linen-border text-center flex flex-col items-center mt-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Check size={26} />
            </div>
            <h2 className="text-base font-bold text-charcoal">All Caught Up</h2>
            <p className="text-xs text-warmgrey mt-1">
              You have no notifications right now.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-linen-border divide-y divide-linen-border shadow-xs overflow-hidden">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && markAsRead(item.id)}
                className={`p-4 flex items-start gap-3.5 transition cursor-pointer hover:bg-linen-surface/50 ${
                  !item.read ? 'bg-amber-50/20' : 'bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-linen-surface border border-linen-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      !item.read ? 'font-bold text-charcoal' : 'text-neutral-700'
                    }`}
                  >
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-warmgrey">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {item.type === 'welcome' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Security Guaranteed
                      </span>
                    )}
                  </div>
                </div>
                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-terracotta mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
