'use client';

import DashboardActivityLog from '@/components/DashboardActivityLog';
import ErrorMessage from '@/components/ErrorMessage';
import Navbar from '@/components/shared/Navbar';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManageAccountPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser.getCurrentUserQuery) ?? null;
  const updateAccount = useMutation(api.admin.updateAdminAccount.updateAccount);

  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form values when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFullname(currentUser.fullname || '');
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!fullname.trim() && !username.trim()) {
        setError('Please provide at least one field to update.');
        setIsSubmitting(false);
        return;
      }

      if (fullname.trim() && fullname.trim().length < 2) {
        setError('Full name must be at least 2 characters long.');
        setIsSubmitting(false);
        return;
      }

      if (username.trim() && username.trim().length < 3) {
        setError('Username must be at least 3 characters long.');
        setIsSubmitting(false);
        return;
      }

      const updates: { fullname?: string; username?: string } = {};
      
      if (fullname.trim() && fullname !== currentUser?.fullname) {
        updates.fullname = fullname.trim();
      }
      
      if (username.trim() && username !== currentUser?.username) {
        updates.username = username.trim();
      }

      if (Object.keys(updates).length === 0) {
        setError('No changes detected.');
        setIsSubmitting(false);
        return;
      }

      await updateAccount(updates);
      setSuccess('Account updated successfully!');
      
      // Reload the page after a short delay to show updated info
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!clerkUser || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          title="Authentication Required" 
          message="Please sign in to access this page." 
          onCloseAction={() => router.push('/')} 
        />
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          title="Access Denied" 
          message="Only administrators can access this page." 
          onCloseAction={() => router.push('/dashboard')} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar>
        <DashboardActivityLog />
      </Navbar>

      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Account</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Update your profile information</p>

          {/* Current Info Display */}
          <div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Current Information</h2>
            <div className="space-y-1 text-gray-700 text-sm">
              <p><span className="font-medium">Email:</span> {currentUser.email}</p>
              <p><span className="font-medium">Full Name:</span> {currentUser.fullname}</p>
              <p><span className="font-medium">Username:</span> {currentUser.username}</p>
              <p><span className="font-medium">Role:</span> {currentUser.role}</p>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">This is how your name will appear in activity logs.</p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Username must be unique and at least 3 characters long.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSubmitting ? 'Updating...' : 'Update Account'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Note</h3>
            <p className="text-sm text-blue-700">
              Your email address is managed through your authentication provider and cannot be changed here.
              Changes to your name and username will be reflected throughout the system.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
