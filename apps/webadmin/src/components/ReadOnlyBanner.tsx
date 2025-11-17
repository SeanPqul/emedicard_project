'use client';

import React from 'react';

/**
 * ReadOnlyBanner - Displays a prominent notification banner for system administrators
 * when they are in read-only oversight mode.
 * 
 * This component informs system admins that they can view all data but cannot make
 * changes to applications, documents, or payments.
 */
const ReadOnlyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-900 mb-1">
            👁️ Read-Only Oversight Mode
          </h3>
          <p className="text-sm text-blue-800">
            You are viewing this dashboard in <strong>System Administrator oversight mode</strong>. 
            You can view all data across all categories but <strong>cannot make changes</strong> to applications, 
            documents, or payments. To perform actions, please use a regular admin account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyBanner;
