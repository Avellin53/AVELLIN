
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
  Ban // Import the Ban icon for the block button
} from 'lucide-react';
import { toast } from 'sonner';
// Assuming your server action can handle custom statuses, or we just resolve it to clear it
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (id: string, eventType: string, action: 'resolved' | 'blocked', ip: string) => {
    setProcessingId(id);
    try {
      // Clear it from the database using your existing server action
      const res = await resolveSecurityAlert(id); 
      
      if (res.error) {
        toast.error(`Failed to process alert: ${res.error}`);
      } else {
        // Remove from UI
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        
        if (action === 'blocked') {
           toast.error(`IP Blocked: ${ip}`, {
             description: 'Alert cleared. Please add this IP to your Vercel Firewall to enforce the ban.',
             duration: 10000 // Keep it on screen longer so you can copy the IP
           });
        } else {
           toast.success(`Security threat resolved: ${eventType}`, {
             description: 'The incident has been marked as resolved.',
           });
        }
      }
    } catch (err) {
      toast.error('Unexpected error while processing alert');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper function for detailed descriptions
  const getAttackDescription = (eventType: string) => {
    switch(eventType) {
      case 'DDOS_ATTEMPT': 
        return "High-frequency request flooding designed to exhaust server resources.";
      case 'SQL_INJECTION': 
        return "Malicious payload attempting to manipulate or expose database records.";
      case 'DIRECTORY_TRAVERSAL': 
        return "Attempted unauthorized access to hidden server files and directories.";
      case 'BRUTE_FORCE': 
        return "Repeated automated guessing of login credentials.";
      default: 
        return "Suspicious network activity detected.";
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
      case 'DDOS_ATTEMPT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-sm animate-pulse">
            <ShieldAlert size={12} />
            DDOS ATTEMPT
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

  const renderDetailsSummary = (details: any, eventType: string) => {
    return (
      <div className="space-y-2">
        {/* Inject the dynamic description at the top of the details */}
        <p className="text-[12px] font-bold text-neutral-800">
           {getAttackDescription(eventType)}
        </p>

        {/* Existing details rendering */}
        {(() => {
          if (!details) return <span className="text-neutral-400 italic text-xs">No extra details available</span>;
          if (typeof details === 'string') return <p className="text-xs text-neutral-700 font-mono break-all">{details}</p>;

          return (
            <div className="space-y-1 text-xs">
              {details.target_email && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px]">Email:</span>
                  <span className="font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                    {details.target_email}
                  </span>
                </div>
              )}
              {details.matched_pattern && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-bold text-neutral-500 uppercase text-[10px]">Pattern:</span>
                  <span className="font-bold text-red-600 text-[11px]">{details.matched_pattern}</span>
                </div>
              )}
              {details.target_url && (
                <div className="text-[11px] font-mono text-neutral-600 truncate max-w-[200px] mt-1" title={details.target_url}>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] mr-1">URL:</span>
                  {details.target_url}
                </div>
              )}
              {details.reason && (
                <p className="text-[11px] text-neutral-600 font-medium mt-1">
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
        })()}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-red-200 shadow-md overflow-hidden relative">
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

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-extrabold bg-neutral-50/70">
              <th className="px-6 py-4">Threat / Event</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Incident Details</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-red-50/40 transition-colors bg-white group"
              >
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  {getEventBadge(alert.event_type)}
                </td>

                <td className="px-6 py-4 align-top whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-1 rounded-lg w-fit border border-neutral-200">
                    <Globe size={13} className="text-neutral-500" />
                    <span>{alert.ip_address || '127.0.0.1'}</span>
                  </div>
                </td>

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

                <td className="px-6 py-4 align-top max-w-sm">
                  {renderDetailsSummary(alert.details, alert.event_type)}
                </td>

                {/* THE NEW DUAL ACTION BUTTONS */}
                <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                  <div className="flex flex-col gap-2 items-end">
                    <button
                      onClick={() => handleAction(alert.id, alert.event_type, 'resolved', alert.ip_address)}
                      disabled={processingId === alert.id}
                      className="inline-flex justify-center items-center gap-1.5 px-4 py-2 w-[110px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} className="text-neutral-500" />
                      <span>{processingId === alert.id ? '...' : 'Resolve'}</span>
                    </button>

                    <button
                      onClick={() => handleAction(alert.id, alert.event_type, 'blocked', alert.ip_address)}
                      disabled={processingId === alert.id}
                      className="inline-flex justify-center items-center gap-1.5 px-4 py-2 w-[110px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                    >
                      <Ban size={14} />
                      <span>{processingId === alert.id ? '...' : 'Block IP'}</span>
                    </button>
                  </div>
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
