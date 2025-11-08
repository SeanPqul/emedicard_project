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
  fieldIdentifier?: string; // Field identifier from documentTypes (e.g., 'chestXrayId', 'validId')
};

type ApplicantDetails = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  gender?: string;
  nationality?: string;
  civilStatus?: string;
  organization?: string;
};

type ApplicationData = {
  applicantName: string;
  jobCategoryName: string;
  checklist: ChecklistItem[];
  applicantDetails?: ApplicantDetails;
};

const createAppError = (message: string, title: string = 'Invalid Input'): AppError => ({ title, message });

// Fixed doctor name for Davao City
const FIXED_DOCTOR_NAME = "Dr. TBD"; // TODO: Update this after doctor interview

// Medical documents based on fieldIdentifier (require doctor referral)
const MEDICAL_FIELD_IDENTIFIERS = [
  'chestXrayId',
  'urinalysisId',
  'stoolId',
  'drugTestId',
  'neuroExamId',
  'hepatitisBId'
];

// Helper to check if document is medical (requires referral to doctor)
const isMedicalDocument = (fieldIdentifier?: string): boolean => {
  if (!fieldIdentifier) return false;
  return MEDICAL_FIELD_IDENTIFIERS.includes(fieldIdentifier);
};

// Medical requirement referral reasons (checkbox options)
const medicalReferralReasons = [
  'Abnormal chest X-ray result',
  'Elevated urinalysis values',
  'Positive stool examination',
  'Positive drug test result',
  'Failed neuropsychiatric evaluation',
  'Hepatitis B antibody - requires consultation',
  'Other medical concern',
];

// Non-medical requirement issue options (for flagging document problems)
const nonMedicalIssueOptions = [
  'Invalid Government-issued ID',
  'Expired ID',
  'Blurry or unclear photo',
  'Wrong ID picture format/size',
  'Missing required information',
  'Others'
];
const issueCategories = [
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
    'Rejected': 'bg-blue-50 text-blue-700 border border-blue-200', // "Referred" status (internally still "Rejected")
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Missing': 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  
  // Display "Referred" label for Rejected status (NO REJECTION terminology per doctor's requirement)
  const displayLabel = status === 'Rejected' ? 'Referred' : status;
  
  return (
    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-lg ${statusStyles[status] || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
      {displayLabel}
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
  const [openReferralIndex, setOpenReferralIndex] = useState<number | null>(null);
  const [referralReason, setReferralReason] = useState<string>('');
  const [issueCategory, setIssueCategory] = useState('other');
  const [specificIssues, setSpecificIssues] = useState('');
  const [extractedText, setExtractedText] = useState<string[] | null>(null); // New state for extracted text
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false); // New state for OCR modal visibility
  const [isReferralConfirmModalOpen, setIsReferralConfirmModalOpen] = useState(false); // Confirmation modal for sending referrals
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false); // New state for collapsible applicant details
  const router = useRouter();

  // --- DATA FETCHING ---
  // @ts-ignore - Type instantiation is excessively deep
  const getDocumentsWithClassification = useAction(api.applications.getDocumentsWithClassification.get);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reviewDocument = useMutation(api.admin.reviewDocument.review);
  const referDocumentMutation = useMutation(api.admin.documents.rejectDocument.rejectDocument); // Actually refers documents
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
    const documentItem = data?.checklist[index];
    await reviewDocument({
      documentUploadId: uploadId,
      status: newStatus,
      remarks: '',
      extractedText: documentItem?.extractedText || undefined, // Pass extracted text
      fileType: documentItem?.fileUrl?.split('.').pop() || undefined, // Infer file type from URL
    });
    await loadData(); // Refresh data after status change
  };

  // --- HANDLER FUNCTIONS ---
  const handleFinalize = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      setError(null);
      const pendingDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Missing' || doc.status === 'Pending');
      const referredDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected') || []; // "Rejected" status = referred/flagged
      
      if (pendingDocs && pendingDocs.length > 0) {
        throw new Error("Please review and assign a status (Approve or Flag/Refer) to all documents before proceeding.");
      }
      
      // Prevent approval if any documents are referred/flagged
      if (newStatus === 'Approved' && referredDocs.length > 0) {
        throw new Error(`Cannot approve application. ${referredDocs.length} document(s) flagged or referred for medical management. Please use 'Send Referral Notification' button instead.`);
      }
      
      if (newStatus === 'Rejected' && !data?.checklist.some((doc: ChecklistItem) => doc.status === 'Rejected')) {
        throw new Error("To send referral notifications, at least one document must be flagged or referred for medical management.");
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

  // Handler to open referral confirmation modal
  const handleSendReferralClick = async () => {
    const referredCount = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected').length || 0;
    if (referredCount === 0) {
      setError({ title: "Validation Failed", message: "To send referral notifications, at least one medical document must be referred to a doctor." });
      return;
    }
    
    // Open confirmation modal
    setIsReferralConfirmModalOpen(true);
  };

  // Handler to confirm sending referral notifications
  const handleConfirmSendReferral = async () => {
    setIsReferralConfirmModalOpen(false);
    await handleFinalize('Rejected'); // This will trigger sendReferralNotifications
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
          <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl hover:bg-white/70 transition-all border border-gray-200 bg-white/50" aria-label="Go back">
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
            
            {/* Collapsible Applicant Details Card */}
            {data.applicantDetails && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={isDetailsExpanded}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-800">Applicant Details</h2>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isDetailsExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isDetailsExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2 space-y-3 border-t border-gray-100">
                    {/* First Name */}
                    {data.applicantDetails?.firstName && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">First Name</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.firstName}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Last Name */}
                    {data.applicantDetails?.lastName && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Name</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.lastName}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Middle Name */}
                    {data.applicantDetails?.middleName && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Middle Name</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.middleName}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Gender */}
                    {data.applicantDetails?.gender && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.gender}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Nationality */}
                    {data.applicantDetails?.nationality && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nationality</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.nationality}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Civil Status */}
                    {data.applicantDetails?.civilStatus && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Civil Status</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.civilStatus}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Organization */}
                    {data.applicantDetails?.organization && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</label>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{data.applicantDetails.organization}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Email */}
                    {data.applicantDetails?.email && (
                      <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                        <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Email Address</label>
                          <p className="text-sm font-medium text-teal-900 mt-0.5 break-all">{data.applicantDetails.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
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
                const totalDocs = data?.checklist.length || 0;
                
                if (rejectedCount > 0) {
                  // Show appropriate warning based on rejected count
                  const warningLevel = rejectedCount > 3 ? 'severe' : rejectedCount >= 2 ? 'warning' : 'info';
                  const bgColor = warningLevel === 'severe' ? 'bg-red-50 border-red-300' : warningLevel === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
                  const textColor = warningLevel === 'severe' ? 'text-red-800' : warningLevel === 'warning' ? 'text-orange-800' : 'text-blue-800';
                  const iconColor = warningLevel === 'severe' ? 'text-red-600' : warningLevel === 'warning' ? 'text-orange-600' : 'text-blue-600';
                  
                  return (
                    <div className={`mb-4 ${bgColor} border rounded-lg p-3`}>
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={`text-sm ${textColor}`}>
                          <p className="font-semibold mb-1">
                            {warningLevel === 'severe' ? '⚠️ High Referral Rate' : 'Pending Referral/Management Notifications'} ({rejectedCount} of {totalDocs})
                          </p>
                          <p className={warningLevel === 'severe' ? 'text-red-700' : warningLevel === 'warning' ? 'text-orange-700' : 'text-blue-700'}>
                            {rejectedCount > 3 
                              ? `More than 3 medical documents referred (${rejectedCount}/${totalDocs}). Please review before sending notifications to applicant.`
                              : rejectedCount === 1
                              ? '1 pending referral/management notification to be sent to applicant. Click "Send Referral Notification" below to proceed.'
                              : `${rejectedCount} pending referral/management notification(s) to be sent to applicant. Click "Send Referral Notification" below to proceed.`
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
                {/* Primary Action: Approve */}
                <button 
                  onClick={() => handleFinalize('Approved')} 
                  className="group w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-teal-500 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve & Continue to Payment
                </button>
                
                {/* Secondary Action: Send Referral Notification */}
                <button 
                  onClick={handleSendReferralClick} 
                  className="group w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Referral Notification
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
            
            {/* Resubmission feature turned off per policy */}
            
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
                            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                          )}
                          <h3 className="font-bold text-gray-800 text-base">{item.requirementName}{item.isRequired && <span className="text-rose-500 ml-1">*</span>}</h3>
                        </div>
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
                      <button onClick={() => {
                        setOpenReferralIndex(openReferralIndex === idx ? null : idx);
                        // Reset form when opening
                        if (openReferralIndex !== idx) {
                          setReferralReason('');
                        }
                      }} disabled={!item.uploadId} className="p-2.5 rounded-xl hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-blue-100" aria-label="Add referral/remark">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  {openReferralIndex === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 -m-4 p-4 rounded-b-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">{isMedicalDocument(item.fieldIdentifier) ? '🏥 Refer to Doctor' : '📄 Add Remark'} for "{item.requirementName}"</h4>
                      <div className="space-y-4">
                        {/* Doctor Name Field - Only for medical documents (Read-only, fixed doctor) */}
                        {isMedicalDocument(item.fieldIdentifier) && (
                          <div>
                            <label htmlFor={`doctor-name-${idx}`} className="block text-sm font-medium text-gray-700">
                              Referring Doctor <span className="text-blue-600 text-xs"></span>
                            </label>
                            <input
                              type="text"
                              id={`doctor-name-${idx}`}
                              name={`doctor-name-${idx}`}
                              value={FIXED_DOCTOR_NAME}
                              readOnly
                              className="mt-1 block w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-md cursor-not-allowed sm:text-sm font-medium"
                            />
                          </div>
                        )}
                        
        <div>
          <label htmlFor={`issue-category-${idx}`} className="block text-sm font-medium text-gray-700">{isMedicalDocument(item.fieldIdentifier) ? 'Referral Category' : 'Issue Category'}</label>
          <select
            id={`issue-category-${idx}`}
            name={`issue-category-${idx}`}
            value={issueCategory}
            onChange={(e) => setIssueCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-700 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {issueCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`remark-${idx}`} className="block text-sm font-medium text-gray-700">
            {isMedicalDocument(item.fieldIdentifier) ? 'Medical Referral Reason' : 'Document Issue Reason'} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 space-y-2">
            {(isMedicalDocument(item.fieldIdentifier) ? medicalReferralReasons : nonMedicalIssueOptions).map(option => (
              <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <input type="radio" name={`remark-${idx}`} value={option} checked={referralReason === option} onChange={(e) => setReferralReason(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
                        <div>
                          <label htmlFor={`specific-issues-${idx}`} className="block text-sm font-medium text-gray-700">
                            {isMedicalDocument(item.fieldIdentifier) ? 'Additional Notes (Optional)' : 'Additional Details (Optional)'}
                          </label>
                          <textarea
                            id={`specific-issues-${idx}`}
                            name={`specific-issues-${idx}`}
                            rows={3}
                            value={specificIssues}
                            onChange={(e) => setSpecificIssues(e.target.value)}
                            className="mt-1 text-black block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder={isMedicalDocument(item.fieldIdentifier) 
                              ? "Auto-filled referral message. You may add additional notes here." 
                              : "e.g., ID is blurry, Signature does not match"}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => {
                          setOpenReferralIndex(null);
                          setReferralReason('');
                        }} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-300">Cancel</button>
                        <button onClick={async () => {
                          try {
                            // Validate referral reason
                            if (!referralReason) throw new Error('Please select a referral reason before saving.');

                            // For medical docs, treat as medical referral
                            if (isMedicalDocument(item.fieldIdentifier)) {
                              await referDocumentMutation({
                                documentUploadId: item.uploadId!,
                                rejectionCategory: issueCategory as any,
                                rejectionReason: referralReason,
                                specificIssues: specificIssues.split(',').map(s => s.trim()).filter(s => s),
                                doctorName: FIXED_DOCTOR_NAME, // Use fixed doctor name
                              });
                            } else {
                              // Non-medical: save remark only (do not change status)
                              // Just update the adminRemarks field without changing review status
                              // Only update if status is already Approved or Rejected
                              if (item.status === 'Approved' || item.status === 'Rejected') {
                                await reviewDocument({
                                  documentUploadId: item.uploadId!,
                                  status: item.status as 'Approved' | 'Rejected',
                                  remarks: specificIssues || referralReason,
                                  extractedText: item.extractedText || undefined,
                                  fileType: item.fileUrl?.split('.').pop() || undefined,
                                });
                              } else {
                                // For pending docs, we can't save issues without changing status
                                // This scenario should prompt the user to approve/flag first
                                throw new Error('Please approve or flag the document before adding remarks.');
                              }
                            }

                            await loadData();
                            setOpenReferralIndex(null);
                            setReferralReason('');
                            setIssueCategory('other');
                            setSpecificIssues('');
                            setError(null);
                          } catch (e: any) {
                            setError(createAppError(e.message, 'Validation Error'));
                          }
                        }} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700">{isMedicalDocument(item.fieldIdentifier) ? 'Save Referral' : 'Save Remark'}</button>
                      </div>
                    </div>
                  )}

                  {/* Always show 2 buttons for medical docs, 1 for non-medical */}
                  <div className={`mt-4 pt-4 border-t border-gray-100 ${isMedicalDocument(item.fieldIdentifier) ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'flex'}`}>
                    <button 
                      onClick={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} 
                      disabled={!item.uploadId || item.status === 'Approved'} 
                      className="w-full bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-emerald-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    {/* Always show for medical docs (even if approved) for demo/testing visibility */}
                    {isMedicalDocument(item.fieldIdentifier) && (
                      <button
                        onClick={() => {
                          setOpenReferralIndex(idx);
                          // Prefill referral defaults for medical docs
                          setIssueCategory('other');
                          setReferralReason('Other medical concern'); // Default to first option
                          setSpecificIssues(`Failed Medical Result (${item.requirementName}) - Please refer to ${FIXED_DOCTOR_NAME} at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`);
                        }}
                        disabled={!item.uploadId || item.status === 'Approved' || item.status === 'Rejected'}
                        className="w-full bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-blue-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Refer to Doctor
                      </button>
                    )}
                  </div>
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

      {/* Referral Confirmation Modal */}
      {isReferralConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Info Icon */}
            <div className="mx-auto mb-5 w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Modal Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Send Referral Notifications?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The applicant will be notified about medical document referrals.
            </p>
            
            {(() => {
              const referredCount = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Rejected').length || 0;
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium">
                    📧 {referredCount === 1 
                      ? '1 referral notification will be sent to the applicant.'
                      : `${referredCount} referral notifications will be sent (one per medical document referred).`
                    }
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    🏯 The applicant will be advised to see the referred doctor(s) for medical requirements.
                  </p>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setIsReferralConfirmModalOpen(false)}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendReferral}
                className="flex-1 px-8 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg"
              >
                Send Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
