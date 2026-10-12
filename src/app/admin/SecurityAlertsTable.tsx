'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { resolveSecurityAlert } from './actions';

export interface SecurityAlert {
  id: string;
  event_type: string;
  details: any;
  ip_address: string;
  status: string;
  created_at: string;
}

export default function SecurityAlertsTable({
  initialAlerts,
}: {
  initialAlerts: SecurityAlert[];
}) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(initialAlerts);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (id: string, eventType: string) => {
    setResolvingId(id);
    try {
      const res = await resolveSecurityAlert(id);
      if (res.error) {
        toast.error(`Failed to resolve alert: ${res.error}`);
      } else {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        toast.success(`Security threat resolved: ${eventType}`, {
          description: 'The incident has been marked as resolved in security logs.',
        });
      }
    } catch (err) {
      toast.error('Unexpected error while resolving alert');
    } finally {
      setResolvingId(null);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'BRUTE_FORCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 border border-red-300 shadow-sm animate-pulse">
            <Lock size={12} className="text-red-600" />
            BRUTE FORCE
          </span>
        );
      case 'SUSPICIOUS_PAYLOAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300 shadow-sm">
            <AlertTriangle size={12} className="text-orange-600" />
            SUSPICIOUS PAYLOAD
          </span>
        );
      case 'UNAUTHORIZED_ACCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 shadow-sm">
            <ShieldAlert size={12} className="text-purple-600" />
            UNAUTHORIZED ACCESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300 shadow-sm">
            <ShieldAlert size={12} />
            {type}
          </span>
        );
    }
  };

  const renderDetailsSummary = (details: any) => {
    if (!details) return <span className="text-neutral-400 italic">No details available</span>;

    if (typeof details === 'string') {
      return <p className="text-xs text-neutral-700 font-mono break-all">{details}</p>;
    }

    return (
      <div className="space-y-1 text-xs">
        {details.target_email && (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-500 uppercase text-[10px]">Email:</span>
            <span className="font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
              {details.target_email}
            </span>
          </div>
        )}
        {details.matched_pattern && (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-500 uppercase text-[10px]">Pattern:</span>
            <span className="font-bold text-red-600 text-[11px]">{details.matched_pattern}</span>
          </div>
        )}
        {details.target_url && (
          <div className="text-[11px] font-mono text-neutral-600 truncate max-w-sm" title={details.target_url}>
            <span className="font-bold text-neutral-500 uppercase text-[10px] mr-1">URL:</span>
            {details.target_url}
          </div>
        )}
        {details.reason && (
          <p className="text-[11px] text-neutral-600 font-medium">
            {details.reason}
          </p>
        )}
        {details.consecutive_failed_attempts && (
          <span className="inline-block text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md mt-1">
            {details.consecutive_failed_attempts} Consecutive Failures
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-red-200 shadow-md overflow-hidden relative">
      {/* High-Contrast Header Bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-b border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-md animate-bounce">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-red-950">
                Security Alerts Dashboard
              </h2>
              {alerts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white shadow-sm">
                  {alerts.length} UNRESOLVED
                </span>
              )}
            </div>
            <p className="text-xs text-red-800/80 mt-0.5 font-medium">
              Real-time surveillance monitoring brute-force attempts and suspicious injection payloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-600 bg-white border border-red-200 px-3 py-1.5 rounded-xl shadow-xs">
            Status: Active Monitoring
          </span>
        </div>
      </div>

      {/* Alert Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-extrabold bg-neutral-50/70">
              <th className="px-6 py-4">Threat / Event</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Incident Details</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-red-50/40 transition-colors bg-white group"
              >
                {/* Event Type */}
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  {getEventBadge(alert.event_type)}
                </td>

                {/* IP Address */}
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-1 rounded-lg w-fit border border-neutral-200">
                    <Globe size={13} className="text-neutral-500" />
                    <span>{alert.ip_address || '127.0.0.1'}</span>
                  </div>
                </td>

                {/* Timestamp */}
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                    <Clock size={13} className="text-warmgrey" />
                    <span>
                      {alert.created_at
                        ? new Date(alert.created_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                </td>

                {/* Incident Details */}
                <td className="px-6 py-4 align-top max-w-md">
                  {renderDetailsSummary(alert.details)}
                </td>

                {/* The Resolve Button */}
                <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                  <button
                    onClick={() => handleResolve(alert.id, alert.event_type)}
                    disabled={resolvingId === alert.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm hover:shadow-md disabled:opacity-50"
                    title="Mark alert as resolved in Supabase"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400 group-hover:text-white" />
                    <span>
                      {resolvingId === alert.id ? 'Resolving...' : 'Resolve'}
                    </span>
                  </button>
                </td>
              </tr>
            ))}

            {alerts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Zero Active Security Alerts
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-sm">
                      All suspicious payloads, traversal attacks, and brute force login attempts have been investigated and resolved.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
