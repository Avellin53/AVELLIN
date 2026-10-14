'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { updateSecurityAlertStatus } from './actions';

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
  const router = useRouter();
  const supabase = createClient();

  const refreshAlerts = () => {
    router.refresh();
  };

  // 1. Helper function to map attack descriptions
  const getAttackDescription = (eventType: string) => {
    switch (eventType) {
      case 'DDOS_ATTEMPT':
        return 'High-frequency request flooding designed to exhaust server resources.';
      case 'SQL_INJECTION':
      case 'SUSPICIOUS_PAYLOAD':
        return 'Malicious payload attempting to manipulate or expose database records.';
      case 'DIRECTORY_TRAVERSAL':
        return 'Attempted unauthorized access to hidden server files and directories.';
      case 'BRUTE_FORCE':
        return 'Repeated automated guessing of login credentials.';
      default:
        return 'Suspicious network activity detected.';
    }
  };

  // 2. Function to handle both resolving and blocking
  const handleAlertAction = async (alertId: string, action: 'resolved' | 'blocked', ipAddress: string) => {
    // Immediately remove from current unresolved view for responsive UI
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));

    try {
      // Update the status in Supabase so it clears from the 'unresolved' queue
      await supabase.from('security_logs').update({ status: action }).eq('id', alertId);
      await updateSecurityAlertStatus(alertId, action);
    } catch (err) {
      console.error('Error updating alert status:', err);
    }

    if (action === 'blocked') {
      alert(`Alert marked as BLOCKED. To physically block ${ipAddress}, add it to your Vercel Firewall settings.`);
    } else {
      toast.success('Security alert marked as resolved.');
    }

    // Trigger a state refresh to update the UI
    refreshAlerts();
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
              Real-time surveillance monitoring DDoS attacks, brute-force attempts, and suspicious injection payloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-600 bg-white border border-red-200 px-3 py-1.5 rounded-xl shadow-xs">
            Status: Active Monitoring
          </span>
        </div>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-gray-100">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {alert.event_type === 'DDOS_ATTEMPT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white border border-red-700 shadow-md animate-pulse">
                    <Flame size={13} className="text-amber-300" />
                    <span>DDOS ATTEMPT (HIGH SEVERITY)</span>
                  </span>
                ) : alert.event_type === 'BRUTE_FORCE' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-300">
                    <Lock size={12} />
                    <span>BRUTE FORCE</span>
                  </span>
                ) : alert.event_type === 'SUSPICIOUS_PAYLOAD' || alert.event_type === 'SQL_INJECTION' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300">
                    <AlertTriangle size={12} />
                    <span>SUSPICIOUS PAYLOAD</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                    <ShieldAlert size={12} />
                    <span>{alert.event_type}</span>
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {alert.ip_address}
                </span>
                {alert.details?.request_count && (
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {alert.details.request_count} req/min
                  </span>
                )}
              </div>
              {/* Detailed description */}
              <p className="text-sm text-gray-700">{getAttackDescription(alert.event_type)}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                <span>Target: {alert.details?.target_url || alert.details?.path || 'N/A'}</span>
                {alert.details?.reason && <span>• {alert.details.reason}</span>}
              </div>
            </div>

            {/* The dual-button interface */}
            <div className="flex space-x-3 mt-3 md:mt-0">
              <button 
                onClick={() => handleAlertAction(alert.id, 'resolved', alert.ip_address)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition"
              >
                Resolve
              </button>
              <button 
                onClick={() => handleAlertAction(alert.id, 'blocked', alert.ip_address)}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition shadow-sm"
              >
                Block IP
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="px-6 py-16 text-center">
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
          </div>
        )}
      </div>
    </div>
  );
}
