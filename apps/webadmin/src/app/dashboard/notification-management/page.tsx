'use client';

import { useStoreUser } from '@/app/hooks/useStoreUser';
import Navbar from '@/components/shared/Navbar';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function NotificationManagementPage() {
  const router = useRouter();

  const adminNotifications = useQuery(api.notifications.getAdminNotifications, { notificationType: undefined });
  const rejectionHistoryNotifications = useQuery(api.notifications.getRejectionHistoryNotifications, {});
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const notifications = [...(adminNotifications || []), ...(rejectionHistoryNotifications || [])]
    .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

  const [filter, setFilter] = useState('all');

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = notifications?.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'read') return n.isRead;
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800" aria-label="Go back to dashboard"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            </div>
            <div className="flex items-center gap-4">
                <select onChange={(e) => setFilter(e.target.value)} value={filter} className="border-gray-300 text-gray-700 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="all">All</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                </select>
                <button onClick={handleMarkAllAsRead} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700 flex-shrink-0">Mark all as read</button>
            </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotifications?.map((notification) => (
                        <tr key={notification._id} className={`${notification.isRead ? 'bg-gray-50' : 'bg-white font-semibold'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(notification._creationTime).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{notification.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{notification.message}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.isRead ? 'bg-gray-100 text-gray-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {notification.isRead ? 'Read' : 'Unread'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={notification.actionUrl || '#'} onClick={() => {
                                  // Don't mark resubmission/referral notifications as read via regular markAsRead
                                  const isReferralType = 
                                    notification.notificationType === "DocumentResubmission" ||
                                    notification.notificationType === "DocumentReferredMedical" ||
                                    notification.notificationType === "DocumentIssueFlagged" ||
                                    notification.notificationType === "MedicalReferralResubmission" ||
                                    notification.notificationType === "DocumentResubmission";
                                  
                                  if (!isReferralType) {
                                    markAsRead({ notificationId: notification._id as Id<"notifications"> });
                                  }
                                }} className="text-emerald-600 hover:text-emerald-900">View</Link>
                            </td>
                        </tr>
                    ))}
                    {filteredNotifications?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-400">No notifications found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </main>
    </div>
  );
}

export default function NotificationManagementPageWrapper() {
    return (
        <NotificationManagementPage />
    );
}
