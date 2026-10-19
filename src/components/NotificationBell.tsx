'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  ShieldCheck,
  Sparkles,
  Package,
  X,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export interface NotificationItem {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  } catch {
    return 'Recent';
  }
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch or initialize notifications
  const fetchNotifications = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setUserId(user.id);
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // Table might not exist yet in schema cache (PGRST205)
        console.warn('Notifications query warning:', error.message);
        // Fallback default welcome notification
        const welcomeSeed: NotificationItem = {
          id: 'welcome-default',
          user_id: user.id,
          message: 'Welcome to AVELLIN! Your account is secure and ready for shopping.',
          type: 'welcome',
          read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications([welcomeSeed]);
        setUnreadCount(1);
        setLoading(false);
        return;
      }

      // If user has 0 notifications, seed the welcome notification
      if (!data || data.length === 0) {
        const welcomeMessage =
          'Welcome to AVELLIN! Your account is secure and ready for shopping.';
        const { data: newSeed, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            message: welcomeMessage,
            type: 'welcome',
            read: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!insertError && newSeed) {
          setNotifications([newSeed]);
          setUnreadCount(1);
        } else {
          setNotifications([
            {
              id: 'welcome-temp',
              user_id: user.id,
              message: welcomeMessage,
              type: 'welcome',
              read: false,
              created_at: new Date().toISOString(),
            },
          ]);
          setUnreadCount(1);
        }
      } else {
        setNotifications(data);
        const unread = data.filter((n: NotificationItem) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchNotifications();
      } else {
        setUserId(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    } catch (err) {
      console.warn('Could not update notification read status:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);

    if (!userId) return;

    try {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    } catch (err) {
      console.warn('Could not mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
      case 'security':
        return <ShieldCheck size={16} className="text-emerald-600" />;
      case 'order':
        return <Package size={16} className="text-terracotta" />;
      default:
        return <Sparkles size={16} className="text-ochre" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
      >
        <Bell size={20} className="text-charcoal" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-linen animate-in zoom-in-75 duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-linen-border z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-linen-surface/70 border-b border-linen-border">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-charcoal">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-2 py-0.5 rounded-full border border-terracotta/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-terracotta hover:underline flex items-center gap-1 px-1.5 py-1 rounded hover:bg-terracotta/5 transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-charcoal p-1 rounded-md transition"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-linen-border">
            {!userId ? (
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-linen-surface flex items-center justify-center text-warmgrey mb-2.5">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-bold text-charcoal">Sign in for updates</p>
                <p className="text-[11px] text-warmgrey mt-1 mb-3">
                  Log in to track your custom bespoke orders, vendor messages, and security alerts.
                </p>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-sm hover:bg-black transition"
                >
                  Sign In
                </Link>
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-xs text-warmgrey flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Check size={18} />
                </div>
                <p className="text-xs font-bold text-charcoal">All caught up!</p>
                <p className="text-[11px] text-warmgrey mt-0.5">
                  No unread notifications at this time.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && markAsRead(item.id)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-linen-surface/50 ${
                    !item.read ? 'bg-amber-50/30' : 'bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-linen-surface flex items-center justify-center flex-shrink-0 mt-0.5 border border-linen-border">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        !item.read ? 'font-bold text-charcoal' : 'text-neutral-600'
                      }`}
                    >
                      {item.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-warmgrey font-medium">
                        {formatTimeAgo(item.created_at)}
                      </span>
                      {item.type === 'welcome' && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Security Verified
                        </span>
                      )}
                    </div>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-terracotta mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {userId && (
            <div className="p-2.5 bg-linen-surface/40 border-t border-linen-border text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-charcoal hover:text-terracotta flex items-center justify-center gap-1 transition"
              >
                <span>View Full Notification Center</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
