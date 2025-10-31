// src/app/dashboard/[id]/doc_verif/page.tsx
'use client';

import ApplicantActivityLog from '@/components/ApplicantActivityLog';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingScreen from '@/components/shared/LoadingScreen';
import Navbar from '@/components/shared/Navbar';
import SuccessMessage from '@/components/SuccessMessage';
import { api } from '@/convex/_generated/api'; // Moved to top
import { Id } from '@/convex/_generated/dataModel';
import { useAction, useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// --- Data Structures ---
interface AppError { title: string; message: string; }

type ChecklistItem = {
  _id: Id<"jobCategoryDocuments">;
  requirementName: string;
  status: string;
  fileUrl: string | null;
  uploadId: Id<"documentUploads"> | null | undefined;
  remarks: string | null | undefined;
  isRequired: boolean;
  extractedText: string | null | undefined;
  isResubmission?: boolean; // Track if this document was resubmitted
};

type ApplicationData = {
  applicantName: string;
  jobCategoryName: string;
  checklist: ChecklistItem[];
};

const createAppError = (message: string, title: string = 'Invalid Input'): AppError => ({ title, message });
const remarkOptions = [ 'Invalid Government-issued ID', 'Missing Documents Request', 'Unclear Drug Test Results', 'Medical Follow-up Required', 'Others' ];
const rejectionCategories = [
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'wrong_document', label: 'Wrong Document' },
  { value: 'expired_document', label: 'Expired Document' },
  { value: 'incomplete_document', label: 'Incomplete Document' },
  { value: 'invalid_document', label: 'Invalid Document' },
  { value: 'format_issue', label: 'Format Issue' },
  { value: 'other', label: 'Other' },
];

// --- Helper Components for this page ---
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    'Approved': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Rejected': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Missing': 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  return (
    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-lg ${statusStyles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
      {status}
    </span>
  );
};

type PageProps = { params: Promise<{ id: Id<'applications'> }> };

export default function DocumentVerificationPage({ params: paramsPromise }: PageProps) {
  const params = React.use(paramsPromise);
  // --- STATE MANAGEMENT ---
  const [viewModalDocUrl, setViewModalDocUrl] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openRemarkIndex, setOpenRemarkIndex] = useState<number | null>(null);
  const [selectedRemark, setSelectedRemark] = useState<string>('');
  const [rejectionCategory, setRejectionCategory] = useState('other');
  const [specificIssues, setSpecificIssues] = useState('');
  const [extractedText, setExtractedText] = useState<string[] | null>(null); // New state for extracted text
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false); // New state for OCR modal visibility
  const [isRejectConfirmModalOpen, setIsRejectConfirmModalOpen] = useState(false); // New state for rejection confirmation
  const [rejectError, setRejectError] = useState<{[key: number]: string}>({}); // Track reject button errors per document
  const router = useRouter();

  // --- DATA FETCHING ---
  const getDocumentsWithClassification = useAction(api.applications.getDocumentsWithClassification.get);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reviewDocument = useMutation(api.admin.reviewDocument.review);
  const rejectDocumentMutation = useMutation(api.admin.documents.rejectDocument.rejectDocument);
  const finalizeApplication = useMutation(api.admin.finalizeApplication.finalize);

  const loadData = async () => {
    try {
      const result = await getDocumentsWithClassification({ id: params.id });
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [getDocumentsWithClassification, params.id]);

  // Add polling for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (index: number, uploadId: Id<'documentUploads'>, newStatus: 'Approved' | 'Rejected') => {
    setError(null);
    if (newStatus === 'Rejected') {
      setSelectedRemark(data?.checklist[index].remarks || '');
      setOpenRemarkIndex(index);
    } else {
      setOpenRemarkIndex(null);
      const documentItem = data?.checklist[index];
      await reviewDocument({
        documentUploadId: uploadId,
        status: newStatus,
        remarks: '',
        extractedText: documentItem?.extractedText || '', // Pass extracted text
        fileType: documentItem?.fileUrl?.split('.').pop() || '', // Infer file type from URL
      });
      await loadData(); // Refresh data after status change
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleFinalize = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      setError(null);
      const pendingDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Missing' || doc.status === 'Pending');
      const rejectedDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected') || [];
      
      if (pendingDocs && pendingDocs.length > 0) {
        throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
      }
      
      // BUG FIX #2: Prevent approval if any documents are rejected
      if (newStatus === 'Approved' && rejectedDocs.length > 0) {
        throw new Error(`Cannot approve application. ${rejectedDocs.length} document(s) are rejected. Please use 'Reject & Notify Applicant' button instead.`);
      }
      
      if (newStatus === 'Rejected' && !data?.checklist.some((doc: ChecklistItem) => doc.status === 'Rejected')) {
        throw new Error("To reject the application, at least one document must be marked as 'Rejected'.");
      }

      await finalizeApplication({ applicationId: params.id, newStatus });
      
      // Different success messages based on status
      if (newStatus === 'Approved') {
        setSuccessMessage('Application approved! Redirecting to payment validation...');
      } else {
        setSuccessMessage('Application rejected. Applicant has been notified.');
      }

      setTimeout(() => {
        if (newStatus === 'Approved') {
          router.push(`/dashboard/${params.id}/payment_validation`);
        } else {
          router.push('/dashboard');
        }
      }, 2000);

    } catch (e: any) {
      setError({ title: "Validation Failed", message: e.message });
    }
  };

  // Handler to open rejection confirmation modal
  const handleRejectClick = () => {
    const rejectedCount = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected').length || 0;
    if (rejectedCount === 0) {
      setError({ title: "Validation Failed", message: "To reject the application, at least one document must be marked as 'Rejected'." });
      return;
    }
    setIsRejectConfirmModalOpen(true);
  };

  // Handler to confirm rejection
  const handleConfirmReject = async () => {
    setIsRejectConfirmModalOpen(false);
    await handleFinalize('Rejected');
  };

  // --- RENDER ---
  if (isLoading) {
    return <LoadingScreen title="Loading Application" message="Please wait while we fetch the application details..." />;
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The application you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-slate-100">
      <Navbar>
        <ApplicantActivityLog applicantName={data.applicantName} applicationId={params.id} />
      </Navbar>

      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <header className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-white/70 transition-all border border-gray-200 bg-white/50" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Document Verification</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Review and validate the applicant's submitted documents.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Left Column: Applicant Info & Actions */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-20">
            {/* Applicant Card with Avatar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-linear-to-br from-teal-400 to-emerald-500 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-teal-600">{data.applicantName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-medium text-white/80 uppercase tracking-wide">Applicant</h2>
                    <p className="text-lg font-bold text-white mt-0.5">{data.applicantName}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Category</label>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{data.jobCategoryName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Documents</label>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{data.checklist.length} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <label className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Approved</label>
                      <p className="text-sm font-semibold text-emerald-700 mt-0.5">{data.checklist.filter(d => d.status === 'Approved').length} docs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-bold text-gray-800">Final Actions</h2>
              </div>
              {error && (
                <div className="mb-4">
                  <ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} />
                </div>
              )}
              {successMessage && (
                <div className="mb-4">
                  <SuccessMessage message={successMessage} />
                </div>
              )}
              {(() => {
                const rejectedCount = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected').length || 0;
                if (rejectedCount > 0) {
                  return (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Rejection Notifications Queued ({rejectedCount})</p>
                          <p className="text-blue-700">
                            {rejectedCount === 1 
                              ? 'The rejected document notification will be sent to the applicant when you click "Reject Application" below.'
                              : `${rejectedCount} individual notifications will be sent to the applicant (one per rejected document) when you click "Reject Application" below.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleFinalize('Approved')} 
                  className="group w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-teal-500 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve & Continue
                </button>
                <button 
                  onClick={handleRejectClick} 
                  className="group w-full bg-gradient-to-r from-rose-400 to-red-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-rose-500 hover:to-red-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {data?.checklist.some((doc: ChecklistItem) => doc.status === 'Rejected') 
                    ? 'Reject & Notify Applicant'
                    : 'Reject Application'
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Document Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Document Checklist</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Review each document carefully before approval</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
                    <p className="text-sm font-bold text-teal-600">{Math.round((data.checklist.filter(d => d.status === 'Approved').length / data.checklist.length) * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
            
            {/* Resubmission Notice Banner */}
            {(() => {
              const resubmittedDocs = data?.checklist.filter((doc: ChecklistItem) => doc.isResubmission) || [];
              if (resubmittedDocs.length > 0) {
                return (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-blue-900 mb-1">
                          🔄 {resubmittedDocs.length === 1 ? '1 Document Resubmitted' : `${resubmittedDocs.length} Documents Resubmitted`}
                        </h3>
                        <p className="text-sm text-blue-800">
                          The applicant has resubmitted {resubmittedDocs.length === 1 ? 'a document' : 'documents'} that {resubmittedDocs.length === 1 ? 'was' : 'were'} previously rejected. 
                          {resubmittedDocs.length === 1 ? 'It is' : 'They are'} marked with a 🔄 badge below and pending your review.
                        </p>
                        <div className="mt-2 text-xs text-blue-700 font-medium">
                          <strong>Resubmitted:</strong> {resubmittedDocs.map(d => d.requirementName).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="space-y-4">
              {data.checklist.map((item, idx) => (
                <div key={item._id} className="group border border-gray-200 rounded-2xl p-5 transition-all hover:shadow-md hover:border-teal-200 bg-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {item.status === 'Approved' && (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {item.status === 'Rejected' && (
                            <div className="w-6 h-6 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center">
                              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-bold text-gray-800 text-base">{item.requirementName}{item.isRequired && <span className="text-rose-500 ml-1">*</span>}</h3>
                        </div>
                        {item.isResubmission && (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm">
                            🔄 Resubmitted
                          </span>
                        )}
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.fileUrl ? (
                        <>
                          <button onClick={() => setViewModalDocUrl(item.fileUrl)} className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-200 transition-all border border-slate-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={async () => {
                              if (item.fileUrl) {
                                try {
                                  const response = await fetch(item.fileUrl);
                                  const blob = await response.blob();
                                  const file = new File([blob], "document", { type: blob.type });

                                  const formData = new FormData();
                                  formData.append("file", file);

                                  const ocrResponse = await fetch("/api/ocr", {
                                    method: "POST",
                                    body: formData,
                                  });

                                  if (!ocrResponse.ok) {
                                    const errorData = await ocrResponse.json();
                                    throw new Error(errorData.error || "Failed to extract text.");
                                  }

                                  const result = await ocrResponse.json();
                                  setExtractedText(result.text ? result.text.split('\n') : ["No text found."]);
                                  setShowOcrModal(true);
                                } catch (error: any) {
                                  console.error("OCR Error:", error);
                                  setError({ title: "OCR Failed", message: error.message || "Could not extract text from the document." });
                                }
                              }
                            }}
                            disabled={!item.fileUrl}
                            className="text-sm bg-sky-50 text-sky-700 px-4 py-2 rounded-xl font-medium hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed border border-sky-100 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Extract
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 px-4 py-2 italic">Not Submitted</span>
                      )}
                      <button onClick={() => setOpenRemarkIndex(openRemarkIndex === idx ? null : idx)} disabled={!item.uploadId} className="p-2.5 rounded-xl hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-teal-100" aria-label="Add remark">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  {openRemarkIndex === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -m-4 p-4 rounded-b-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Select a Remark for "{item.requirementName}"</h4>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor={`rejection-category-${idx}`} className="block text-sm font-medium text-gray-700">Rejection Category</label>
                          <select
                            id={`rejection-category-${idx}`}
                            name={`rejection-category-${idx}`}
                            value={rejectionCategory}
                            onChange={(e) => setRejectionCategory(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-700 border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                          >
                            {rejectionCategories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`remark-${idx}`} className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                          <div className="mt-1 space-y-2">
                            {remarkOptions.map(option => (
                              <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input type="radio" name={`remark-${idx}`} value={option} checked={selectedRemark === option} onChange={(e) => setSelectedRemark(e.target.value)} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                <span className="ml-3 text-sm text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor={`specific-issues-${idx}`} className="block text-sm font-medium text-gray-700">Specific Issues (optional, comma-separated)</label>
                          <textarea
                            id={`specific-issues-${idx}`}
                            name={`specific-issues-${idx}`}
                            rows={3}
                            value={specificIssues}
                            onChange={(e) => setSpecificIssues(e.target.value)}
                            className="mt-1 text-black block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="e.g., ID is blurry, Signature does not match"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setOpenRemarkIndex(null)} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-300">Cancel</button>
                        <button onClick={async () => {
                          try {
                            if (!selectedRemark) throw new Error('Please select a remark before saving.');
                            await rejectDocumentMutation({
                              documentUploadId: item.uploadId!,
                              rejectionCategory: rejectionCategory as any,
                              rejectionReason: selectedRemark,
                              specificIssues: specificIssues.split(',').map(s => s.trim()).filter(s => s),
                            });
                            await loadData(); // Refresh data after rejection with remarks
                            setOpenRemarkIndex(null);
                            setError(null);
                          } catch (e: any) {
                            setError(createAppError(e.message, 'Validation Error'));
                          }
                        }} className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-700">Save Remark</button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                    <button 
                      onClick={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} 
                      disabled={!item.uploadId || item.status === 'Approved'} 
                      className="flex-1 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-emerald-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button onClick={() => {
                      // BUG FIX #1: Show error if trying to reject without adding remarks
                      if (!item.remarks || item.remarks.trim() === '') {
                        setRejectError({...rejectError, [idx]: 'Please add remarks first using the edit icon before rejecting this document.'});
                        setTimeout(() => {
                          setRejectError(prev => {const newState = {...prev}; delete newState[idx]; return newState;});
                        }, 5000); // Clear error after 5 seconds
                      } else {
                        setOpenRemarkIndex(idx); // Open remark panel to review
                      }
                    }} 
                    disabled={!item.uploadId || item.status === 'Rejected'} 
                    className="flex-1 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-rose-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-rose-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                  </div>
                  
                  {/* Error message for reject button */}
                  {rejectError[idx] && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                      <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-rose-700 font-medium">{rejectError[idx]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </main>
      {/* The View Document Modal */}
      {viewModalDocUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewModalDocUrl(null)}>
          <div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-gray-900 font-semibold mb-4">Document Preview</h3>
            <div className="w-full h-[calc(100%-80px)] bg-gray-200 rounded-md">
              {viewModalDocUrl.endsWith('.pdf') ? (
                <iframe src={viewModalDocUrl} className="w-full h-full" title="Document Preview"></iframe>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewModalDocUrl} alt="Document Preview" className="w-full h-full object-contain" />
              )}
            </div>
            <button onClick={() => setViewModalDocUrl(null)} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}

      {/* OCR Extracted Text Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowOcrModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Extracted Text (OCR)</h3>
                  <p className="text-sm text-gray-500">Optical Character Recognition Results</p>
                </div>
              </div>
              <button onClick={() => setShowOcrModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 shadow-inner">
                {extractedText && extractedText.length > 0 ? (
                  <div className="space-y-2 font-mono text-sm text-gray-800 leading-relaxed">
                    {extractedText.map((line, i) => (
                      <p key={i} className={`${line.trim() ? 'text-gray-900' : 'text-gray-400'} transition-colors hover:bg-white/50 px-2 py-1 rounded`}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No text extracted or document is empty.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const text = extractedText?.join('\n') || '';
                    navigator.clipboard.writeText(text);
                    alert('Text copied to clipboard!');
                  }}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Text
                </button>
                <button onClick={() => setShowOcrModal(false)} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {isRejectConfirmModalOpen && (
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Reject Application?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Are you sure you want to reject this application? 
            </p>
            
            {(() => {
              const rejectedCount = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected').length || 0;
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 font-medium">
                    {rejectedCount === 1 
                      ? '1 document has been marked as rejected. The applicant will be notified to resubmit this document.'
                      : `${rejectedCount} documents have been marked as rejected. The applicant will be notified to resubmit these documents.`
                    }
                  </p>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setIsRejectConfirmModalOpen(false)}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg"
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
