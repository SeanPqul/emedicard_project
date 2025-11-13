import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { NotificationIcon, getNotificationTypeLabel } from './NotificationIcon';
import type { Id } from '@backend/convex/_generated/dataModel';

export interface NotificationCardProps {
  notification: {
    _id: Id<"notifications"> | Id<"documentRejectionHistory"> | Id<"paymentRejectionHistory">;
    _creationTime: number;
    title?: string;
    message: string;
    notificationType: string;
    actionUrl?: string;
    isRead: boolean;
  };
  onClick?: () => void;
  showBorder?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
  showBorder = true,
}) => {
  const { title, message, notificationType, isRead, _creationTime } = notification;

  // Truncate long messages for card view
  const truncateMessage = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200
        ${!isRead ? 'bg-emerald-50/30 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}
        ${showBorder ? 'border-b border-gray-100' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <NotificationIcon type={notificationType} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Unread Indicator */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={`text-sm font-semibold leading-tight ${
                !isRead ? 'text-gray-900' : 'text-gray-700'
              }`}
            >
              {title || getNotificationTypeLabel(notificationType)}
            </h3>
            {!isRead && (
              <span className="shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            {truncateMessage(message)}
          </p>

          {/* Meta Information */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {/* Type Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
              {getNotificationTypeLabel(notificationType)}
            </span>

            {/* Timestamp */}
            <span>•</span>
            <span className="text-gray-400">
              {formatDistanceToNow(new Date(_creationTime), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for notification bell dropdown
export const NotificationCardCompact: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
}) => {
  const { title, message, notificationType, isRead, _creationTime } = notification;

  // Truncate for compact view - show more text since dropdown is wider now
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-3 hover:bg-gray-50 cursor-pointer transition-colors
        ${!isRead ? 'bg-emerald-50/30' : ''}
        border-b border-gray-100 last:border-b-0
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Smaller Icon */}
        <NotificationIcon type={notificationType} compact={true} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with unread dot */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold leading-tight ${
              !isRead ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {title || getNotificationTypeLabel(notificationType)}
            </p>
            {!isRead && (
              <span className="shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-1"></span>
            )}
          </div>
          
          {/* Message preview */}
          <p className="text-xs text-gray-600 leading-relaxed mb-1.5">
            {truncateText(message)}
          </p>
          
          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(_creationTime), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
