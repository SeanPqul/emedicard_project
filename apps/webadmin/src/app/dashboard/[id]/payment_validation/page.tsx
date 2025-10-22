// src/app/dashboard/[id]/payment_validation/page.tsx
'use client';

import ApplicantActivityLog from '@/components/ApplicantActivityLog';
import CustomUserButton from '@/components/CustomUserButton';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

type ActivityLog = {
  timestamp: Date;
  adminName: string;
  action: string;
  details: string;
};

export default function PaymentValidationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const applicationId = params.id as Id<'applications'>;

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const data = useQuery(api.payments.getForApplication.get, { applicationId });
  const validatePayment = useMutation(api.admin.validatePayment.validate);

  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog((prevLog) => [newLog, ...prevLog]);
  };

  const handleApprove = async () => {
    if (!data) return;
    addLogEntry('Payment Approved', 'The submitted payment was approved.');
    await validatePayment({
      paymentId: data.paymentId,
      applicationId,
      newStatus: 'Complete',
    });
    // Redirect back to dashboard - applicant will book their own orientation slot from mobile app
    router.push('/dashboard');
  };

  const handleReject = async () => {
    if (!data) return;
    addLogEntry('Payment Rejected', 'The submitted payment was rejected.');
    await validatePayment({
      paymentId: data.paymentId,
      applicationId,
      newStatus: 'Failed',
    });
    setIsRejectModalOpen(false);
    router.push('/dashboard');
  };

  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading Payment Details...</h2>
          <p className="text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Not Found</h1>
          <p className="text-gray-600">Payment details for this application could not be found.</p>
          <Link href="/dashboard" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">eM</span>
                </div>
                <span className="text-xl font-bold text-gray-800">eMediCard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ApplicantActivityLog applicantName={data.applicantName} applicationId={applicationId} />
              <CustomUserButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payment Validation</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Receipt */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Proof of Payment</h2>
              {data.receiptUrl ? (
                <div className="relative group">
                  <Image src={data.receiptUrl} alt="Proof of Payment" width={400} height={800} className="rounded-lg w-full" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <a href={data.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-white underline">View Full Size</a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1m6-5l-1.5-1.5" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No Receipt Available</h3>
                    <p className="mt-1 text-sm text-gray-500">The applicant did not submit a receipt.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Applicant Name</label>
                  <p className="text-lg font-semibold text-gray-800">{data.applicantName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Submission Date</label>
                  <p className="text-lg font-semibold text-gray-800">{new Date(data.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                  <p className="text-lg font-semibold text-gray-800">{data.paymentMethod}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reference Number</label>
                  <p className="text-lg font-semibold text-gray-800">{data.referenceNumber}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button onClick={handleApprove} className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Payment
                </button>
                <button onClick={() => setIsRejectModalOpen(true)} className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rejection Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you sure?</h2>
              <p className="text-gray-600 mb-8">This will mark the payment as failed and the applicant will be notified. This action cannot be undone.</p>
            </div>
            <div className="flex bg-gray-50 rounded-b-2xl px-6 py-4">
                <button onClick={() => setIsRejectModalOpen(false)} className="flex-1 px-8 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
                  Cancel
                </button>
                <button onClick={handleReject} className="flex-1 px-8 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 ml-4">
                  Confirm Rejection
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
