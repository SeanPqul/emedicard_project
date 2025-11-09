import React from 'react';

export type NotificationType = 
  | 'ApplicationStatusChange'
  | 'DocumentResubmission'
  | 'PaymentResubmission'
  | 'PaymentReceived'
  | 'ApplicationApproved'
  | 'ApplicationRejected'
  | 'DocumentIssue'
  | 'DocumentApproved'
  | 'OrientationScheduled'
  | 'CardIssue'
  | string;

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
  compact?: boolean; // For smaller bell dropdown version
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ type, className = '', compact = false }) => {
  const getIcon = () => {
    const baseClasses = compact ? "h-4 w-4" : "h-5 w-5";
    const containerSize = compact ? "w-8 h-8" : "w-10 h-10";
    const iconClass = className || baseClasses;

    switch (type) {
      case 'ApplicationRejected':
        return (
          <div className={`${containerSize} rounded-full bg-red-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-red-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      
      case 'DocumentResubmission':
      case 'DocumentIssue':
        return (
          <div className={`${containerSize} rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      
      case 'DocumentApproved':
        return (
          <div className={`${containerSize} rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-emerald-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      
      case 'PaymentResubmission':
      case 'PaymentReceived':
        return (
          <div className={`${containerSize} rounded-full bg-green-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      
      case 'ApplicationStatusChange':
      case 'ApplicationApproved':
        return (
          <div className={`${containerSize} rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-purple-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      
      case 'OrientationScheduled':
        return (
          <div className={`${containerSize} rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-orange-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      
      case 'CardIssue':
        return (
          <div className={`${containerSize} rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-yellow-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      
      default:
        return (
          <div className={`${containerSize} rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`${iconClass} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return getIcon();
};

// Helper function to get notification type label
export const getNotificationTypeLabel = (type: NotificationType): string => {
  const labels: Record<string, string> = {
    'ApplicationStatusChange': 'Application Update',
    'DocumentResubmission': 'Document',
    'PaymentResubmission': 'Payment',
    'PaymentReceived': 'Payment',
    'ApplicationApproved': 'Application',
    'ApplicationRejected': 'Application',
    'DocumentIssue': 'Document',
    'DocumentApproved': 'Document',
    'OrientationScheduled': 'Orientation',
    'CardIssue': 'Card',
  };

  return labels[type] || type.replace(/([A-Z])/g, ' $1').trim();
};
