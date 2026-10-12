'use client';

import React, { useState } from 'react';
import { ShieldAlert, Package, Users } from 'lucide-react';
import SecurityAlertsTable, { SecurityAlert } from './SecurityAlertsTable';
import ProductModerationTable from './ProductModerationTable';

export default function AdminDashboardTabs({
  securityAlerts,
  productsList,
  usersTable,
}: {
  securityAlerts: SecurityAlert[];
  productsList: any[];
  usersTable: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'security' | 'products' | 'users'>(
    securityAlerts.length > 0 ? 'security' : 'products'
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto scrollbar-none">
        {/* Security Alerts Tab */}
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition shadow-xs ${
            activeTab === 'security'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Security Alerts</span>
          {securityAlerts.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'security'
                  ? 'bg-white text-red-600'
                  : 'bg-red-500 text-white animate-pulse'
              }`}
            >
              {securityAlerts.length}
            </span>
          )}
        </button>

        {/* Product Moderation Tab */}
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition shadow-xs ${
            activeTab === 'products'
              ? 'bg-neutral-900 text-white shadow-md'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <Package size={16} />
          <span>Product Moderation</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'products'
                ? 'bg-neutral-800 text-neutral-200'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {productsList.length}
          </span>
        </button>

        {/* User Role Management Tab */}
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition shadow-xs ${
            activeTab === 'users'
              ? 'bg-neutral-900 text-white shadow-md'
              : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          <Users size={16} />
          <span>User Role Management</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'security' && (
        <div className="animate-in fade-in duration-200">
          <SecurityAlertsTable initialAlerts={securityAlerts} />
        </div>
      )}

      {activeTab === 'products' && (
        <div className="animate-in fade-in duration-200">
          <ProductModerationTable initialProducts={productsList} />
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-200">
          {usersTable}
        </div>
      )}
    </div>
  );
}
