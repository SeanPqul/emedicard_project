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

type RejectionHistoryItem = {
  _id: string;
  rejectionCategory: string;
  rejectionReason: string;
  specificIssues: string[];
  rejectedAt: number;
  rejectedBy: string;
  wasReplaced: boolean;
  replacedAt?: number;
  attemptNumber: number;
  referenceNumber: string;
  paymentMethod: string;
  amount: number;
};

type PaymentData = {
  paymentId: Id<'payments'>;
  applicantName: string;
  submissionDate: number;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl: string | null;
  referenceNumber: string;
  isResubmission?: boolean;
  rejectionHistory?: RejectionHistoryItem[];
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
  const [isRejectionHistoryOpen, setIsRejectionHistoryOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Rejection Form State
  const [rejectionCategory, setRejectionCategory] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [specificIssues, setSpecificIssues] = useState<string[]>([]);
  const [newIssue, setNewIssue] = useState<string>("");

  // Data Fetching
  const paymentData = useQuery(api.payments.getForApplication.get, {
    applicationId: params.id,
  });

  const rejectPaymentMutation = useMutation(api.admin.payments.rejectPayment.rejectPayment);
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
      // Validate rejection form
      if (!rejectionCategory) {
        setError({ title: 'Validation Error', message: 'Please select a rejection category.' });
        return;
      }
      if (!rejectionReason.trim()) {
        setError({ title: 'Validation Error', message: 'Please provide a rejection reason.' });
        return;
      }
      
      if (!paymentData?.paymentId) {
        throw new Error('Payment ID not found');
      }

      await rejectPaymentMutation({
        applicationId: params.id,
        paymentId: paymentData.paymentId,
        rejectionCategory,
        rejectionReason,
        specificIssues,
      });

      addLogEntry('Payment Rejected', `Category: ${rejectionCategory}. Reason: ${rejectionReason}`);
      setSuccessMessage('Payment rejected. Applicant will be notified.');
      setIsRejectModalOpen(false);
      
      // Reset form
      setRejectionCategory("");
      setRejectionReason("");
      setSpecificIssues([]);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError({ title: 'Rejection Failed', message: err.message || 'Failed to reject payment.' });
      setIsRejectModalOpen(false);
    }
  };
  
  // Add issue to list
  const handleAddIssue = () => {
    if (newIssue.trim() && !specificIssues.includes(newIssue.trim())) {
      setSpecificIssues([...specificIssues, newIssue.trim()]);
      setNewIssue("");
    }
  };
  
  // Remove issue from list
  const handleRemoveIssue = (issue: string) => {
    setSpecificIssues(specificIssues.filter(i => i !== issue));
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
            onClick={() => router.push(`/dashboard/${params.id}/doc_verif`)} 
            className="p-2 rounded-lg hover:bg-white/80 transition-all shadow-sm" 
            aria-label="Back to document verification"
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
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Payment Receipt</h3>
                <p className="text-gray-600 text-sm">Proof of payment</p>
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
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApproveAndProceed}
                  className="w-full bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Payment
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="w-full bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 border border-red-200 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject Payment
                </button>
                
                {/* Rejection History Button */}
                {paymentData.rejectionHistory && paymentData.rejectionHistory.length > 0 && (
                  <button
                    onClick={() => setIsRejectionHistoryOpen(true)}
                    className="w-full bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 border border-orange-200 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Rejection History ({paymentData.rejectionHistory.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Payment Details */}
          <div className="lg:col-span-2">
            {/* Resubmission Notice Banner */}
            {paymentData.isResubmission && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">
                      🔄 Payment Resubmitted
                    </h3>
                    <p className="text-sm text-blue-800">
                      The applicant has resubmitted their payment after it was previously rejected. Click "View Rejection History" in the Actions panel to see previous attempts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-800">Payment Information</h2>
                      {paymentData.isResubmission && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm">
                          🔄 Resubmitted
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">Verify all details before approval</p>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 cursor-not-allowed font-medium focus:outline-none"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 cursor-not-allowed font-mono font-medium focus:outline-none"
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

      {/* Rejection History Modal */}
      {isRejectionHistoryOpen && paymentData.rejectionHistory && paymentData.rejectionHistory.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
          onClick={() => setIsRejectionHistoryOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5 border-b border-red-200 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2.5 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Rejection History</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {paymentData.rejectionHistory.length} previous rejection{paymentData.rejectionHistory.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRejectionHistoryOpen(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {paymentData.rejectionHistory.map((rejection, idx) => (
                <div 
                  key={rejection._id} 
                  className={`border rounded-xl p-4 ${
                    rejection.wasReplaced 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-800 text-white">
                        Attempt #{rejection.attemptNumber}
                      </span>
                      {rejection.wasReplaced && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-600 text-white flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Replaced
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(rejection.rejectedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Category: </span>
                      <span className="text-gray-600">
                        {rejection.rejectionCategory.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Reason: </span>
                      <span className="text-gray-600">{rejection.rejectionReason}</span>
                    </div>
                    {rejection.specificIssues && rejection.specificIssues.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Specific Issues:</span>
                        <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                          {rejection.specificIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-gray-700">Rejected by: </span>
                      <span className="text-gray-600">{rejection.rejectedBy}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 mt-2">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Reference: {rejection.referenceNumber}</div>
                        <div>Method: {rejection.paymentMethod}</div>
                        <div>Amount: ₱{rejection.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setIsRejectionHistoryOpen(false)}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Detailed Form */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 transform transition-all" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-5 border-b border-red-200 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">Reject Payment</h2>
                  <p className="text-sm text-gray-600">Provide detailed rejection information for {paymentData?.applicantName}</p>
                </div>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="p-2 hover:bg-red-200 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {/* Rejection Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rejection Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={rejectionCategory}
                  onChange={(e) => setRejectionCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium transition-all"
                  required
                >
                  <option value="">Select a category...</option>
                  <option value="invalid_receipt">Invalid Receipt - Fake, manipulated, or not authentic</option>
                  <option value="wrong_amount">Wrong Amount - Payment amount doesn't match requirements</option>
                  <option value="unclear_receipt">Unclear Receipt - Blurry, dark, or unreadable</option>
                  <option value="expired_receipt">Expired Receipt - Receipt is too old or past validity</option>
                  <option value="duplicate_payment">Duplicate Payment - Already used or duplicate transaction</option>
                  <option value="wrong_account">Wrong Account - Payment made to incorrect account</option>
                  <option value="incomplete_info">Incomplete Information - Missing required details</option>
                  <option value="other">Other - Specify in reason below</option>
                </select>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Detailed Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a clear explanation why this payment is being rejected..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 resize-none transition-all"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This will be sent to the applicant</p>
              </div>

              {/* Specific Issues */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Specific Issues (Optional)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIssue}
                      onChange={(e) => setNewIssue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIssue())}
                      placeholder="Add specific issue (e.g., 'Reference number not visible')..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddIssue}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Issues List */}
                  {specificIssues.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {specificIssues.map((issue, index) => (
                        <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">• {issue}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIssue(issue)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-bold text-yellow-800">Important Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      The applicant will be notified and asked to resubmit their payment. This action will be recorded in the rejection history.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionCategory("");
                  setRejectionReason("");
                  setSpecificIssues([]);
                }}
                className="px-6 py-3 rounded-lg font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionCategory || !rejectionReason.trim()}
                className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
