// src/app/dashboard/[id]/payment_validation/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar';
import ApplicantActivityLog from '@/components/ApplicantActivityLog';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';

// Data Structures
type ActivityLog = { 
  timestamp: Date; 
  adminName: string; 
  action: string; 
  details: string; 
};

type PaymentData = {
  paymentId: Id<'payments'>;
  applicantName: string;
  submissionDate: number;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl: string | null;
  referenceNumber: string;
};

type PageProps = { 
  params: Promise<{ id: Id<'applications'> }> 
};

export default function PaymentValidationPage({ params: paramsPromise }: PageProps) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const { user } = useUser();

  // State Management
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data Fetching
  const paymentData = useQuery(api.payments.getForApplication.get, {
    applicationId: params.id,
  });

  const rejectPaymentMutation = useMutation(api.admin.payments.rejectPayment);
  const validatePayment = useMutation(api.admin.validatePayment.validate);

  // Activity Log Helper
  const addLogEntry = (action: string, details: string) => {
    const adminName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown Admin';
    const newLog: ActivityLog = { timestamp: new Date(), adminName, action, details };
    setActivityLog(prevLog => [newLog, ...prevLog]);
  };

  // Approve Handler
  const handleApproveAndProceed = async () => {
    try {
      if (!paymentData?.paymentId) {
        throw new Error('Payment ID not found');
      }

      addLogEntry('Payment Approved', 'The submitted payment was approved and validated.');
      
      await validatePayment({
        paymentId: paymentData.paymentId,
        applicationId: params.id,
        newStatus: 'Complete',
      });
      
      setSuccessMessage('Payment approved successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError({ title: 'Approval Failed', message: err.message || 'Failed to approve payment.' });
    }
  };

  // Reject Handler
  const handleConfirmReject = async () => {
    try {
      if (!paymentData?.paymentId) {
        throw new Error('Payment ID not found');
      }

      await rejectPaymentMutation({
        applicationId: params.id,
        paymentId: paymentData.paymentId,
        rejectionReason: 'Payment Rejected',
      });

      addLogEntry('Payment Rejected', 'The submitted payment was rejected by admin.');
      setSuccessMessage('Payment rejected. Applicant will be notified.');
      setIsRejectModalOpen(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError({ title: 'Rejection Failed', message: err.message || 'Failed to reject payment.' });
      setIsRejectModalOpen(false);
    }
  };

  // Format Date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Loading State
  if (paymentData === undefined) {
    return <LoadingScreen title="Loading Payment Data" message="Please wait while we fetch the payment details..." />;
  }

  // No Payment Data
  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Not Found</h2>
          <p className="text-gray-600 mb-6">No payment record found for this application.</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar with Activity Log */}
      <Navbar>
        <ApplicantActivityLog applicantName={paymentData.applicantName} applicationId={params.id} />
      </Navbar>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 rounded-lg hover:bg-white/80 transition-all shadow-sm" 
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Validation</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Review and validate the applicant's payment submission.</p>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6">
            <ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-6">
            <SuccessMessage message={successMessage} />
          </div>
        )}

        {/* Two Column Layout: Image Left, Details Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column: Receipt Image & Action Buttons */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-20">
            {/* Receipt Image Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white">Payment Receipt</h3>
                <p className="text-emerald-100 text-sm">Proof of payment</p>
              </div>
              
              <div className="p-4">
                {paymentData.receiptUrl ? (
                  <div 
                    className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all"
                    onClick={() => setIsReceiptModalOpen(true)}
                  >
                    <Image
                      src={paymentData.receiptUrl}
                      alt="Payment Receipt"
                      width={400}
                      height={600}
                      className="w-full h-auto object-contain"
                      priority
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg px-4 py-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-800">Click to enlarge</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">No Receipt Available</h4>
                    <p className="text-xs text-gray-500">Payment processed via Maya API</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApproveAndProceed}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Payment
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject Payment
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Information</h2>
                    <p className="text-emerald-100 text-sm">Verify all details before approval</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6">
                {/* Applicant Name */}
                <div className="space-y-2">
                  <label htmlFor="applicantName" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    id="applicantName"
                    value={paymentData.applicantName}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
                  />
                </div>

                {/* Date of Submission */}
                <div className="space-y-2">
                  <label htmlFor="submissionDate" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Date of Submission
                  </label>
                  <input
                    type="text"
                    id="submissionDate"
                    value={formatDate(paymentData.submissionDate)}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label htmlFor="paymentMethod" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    id="paymentMethod"
                    value={paymentData.paymentMethod}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
                  />
                </div>

                {/* Reference Number */}
                <div className="space-y-2">
                  <label htmlFor="referenceNumber" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    id="referenceNumber"
                    value={paymentData.referenceNumber}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-gray-50 cursor-not-allowed font-mono font-medium focus:outline-none"
                  />
                </div>

                {/* Payment Status Badge */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Current Status</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      paymentData.paymentStatus === 'Complete' 
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-600/20' 
                        : paymentData.paymentStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-600/20'
                        : 'bg-red-100 text-red-700 ring-2 ring-red-600/20'
                    }`}>
                      {paymentData.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Receipt Modal */}
      {isReceiptModalOpen && paymentData.receiptUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                {paymentData.receiptUrl.endsWith('.pdf') ? (
                  <iframe 
                    src={paymentData.receiptUrl} 
                    className="w-full h-[600px]" 
                    title="Payment Receipt"
                  />
                ) : (
                  <Image
                    src={paymentData.receiptUrl}
                    alt="Payment Receipt"
                    width={800}
                    height={1000}
                    className="w-full h-auto object-contain"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="mx-auto mb-5 w-20 h-20 flex items-center justify-center bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Reject Payment?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to reject this payment? This action will add the rejection to the history and notify the applicant to resubmit payment.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
