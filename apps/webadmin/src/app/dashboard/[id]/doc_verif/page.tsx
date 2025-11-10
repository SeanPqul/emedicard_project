// src/app/dashboard/[id]/doc_verif/page.tsx
'use client';

import ApplicantActivityLog from '@/components/ApplicantActivityLog';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingScreen from '@/components/shared/LoadingScreen';
import Navbar from '@/components/shared/Navbar';
import SuccessMessage from '@/components/SuccessMessage';
import { api } from '@/convex/_generated/api'; // Moved to top
import { Id } from '@/convex/_generated/dataModel';
import { useAction, useMutation, useQuery } from 'convex/react';
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
  // Attempt tracking fields
  attemptNumber?: number; // Current attempt count (0-4+)
  maxAttemptsReached?: boolean; // True if >= 4 attempts
  remainingAttempts?: number; // Remaining attempts (0-3)
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
    'Referred': 'bg-blue-50 text-blue-700 border border-blue-200', // Medical referral
    'NeedsRevision': 'bg-orange-50 text-orange-700 border border-orange-200', // Document flagged for revision
    'Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Missing': 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  
  // Display user-friendly labels
  const displayLabel = status === 'NeedsRevision' ? 'Needs Revision' : status;
  
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
  const [modalType, setModalType] = useState<'flag_revision' | 'refer_doctor' | null>(null); // Track which modal is open
  const [referralReason, setReferralReason] = useState<string>('');
  const [issueCategory, setIssueCategory] = useState('other');
  const [specificIssues, setSpecificIssues] = useState('');
  const [extractedText, setExtractedText] = useState<string[] | null>(null); // New state for extracted text
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false); // New state for OCR modal visibility
  const [isReferralConfirmModalOpen, setIsReferralConfirmModalOpen] = useState(false); // Confirmation modal for sending referrals
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false); // New state for collapsible applicant details
  const [isPaymentDetailsExpanded, setIsPaymentDetailsExpanded] = useState(false); // New state for collapsible payment details
  const [isOrientationDetailsExpanded, setIsOrientationDetailsExpanded] = useState(false); // New state for collapsible orientation details
  
  // Pending actions state - stores actions before database save
  const [pendingActions, setPendingActions] = useState<{
    uploadId: Id<"documentUploads">;
    actionType: 'flag_revision' | 'refer_doctor';
    category: string;
    reason: string;
    notes: string;
    doctorName?: string;
    documentName: string;
  }[]>([]);
  
  const router = useRouter();

  // --- HELPER FUNCTIONS ---
  // Helper function to check if document has pending action
  const getPendingAction = (uploadId: Id<"documentUploads"> | null | undefined) => {
    if (!uploadId) return null;
    return pendingActions.find(action => action.uploadId === uploadId);
  };
  
  // Helper function to get effective status (pending action or actual status)
  const getEffectiveStatus = (item: ChecklistItem) => {
    const pending = getPendingAction(item.uploadId);
    if (pending) {
      return pending.actionType === 'refer_doctor' ? 'Referred' : 'NeedsRevision';
    }
    return item.status;
  };

  // --- DATA FETCHING ---
  // @ts-ignore - Type instantiation is excessively deep
  const getDocumentsWithClassification = useAction(api.applications.getDocumentsWithClassification.get);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const reviewDocument = useMutation(api.admin.reviewDocument.review);
  const referDocumentMutation = useMutation(api.admin.documents.referDocument.referDocument); // Actually refers documents
  const finalizeApplication = useMutation(api.admin.finalizeApplication.finalize);
  
  // Fetch payment data and application status
  const paymentData = useQuery(api.payments.getForApplication.get, { applicationId: params.id });
  const applicationStatus = useQuery(api.applications.getApplicationById.getApplicationByIdQuery, { applicationId: params.id });
  
  // Fetch orientation details for Food Handlers (Yellow Card)
  const orientationDetails = useQuery(api.admin.orientation.getOrientationByApplicationId, { 
    applicationId: params.id 
  });

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
    
    // Load pending actions from localStorage
    const storageKey = `pendingActions_${params.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load pending actions:', e);
      }
    }
  }, [getDocumentsWithClassification, params.id]);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    const storageKey = `pendingActions_${params.id}`;
    if (pendingActions.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(pendingActions));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [pendingActions, params.id]);

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
      const referredDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Referred') || [];
      
      if (pendingDocs && pendingDocs.length > 0) {
        throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
      }
      
      // Prevent approval if any documents are referred or need revision
      const needsRevisionDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'NeedsRevision') || [];
      const totalPendingDocs = referredDocs.length + needsRevisionDocs.length;
      
      if (newStatus === 'Approved' && totalPendingDocs > 0) {
        throw new Error(`Cannot approve application. ${totalPendingDocs} document(s) require applicant action. Please use 'Send Applicant Notifications' button instead.`);
      }
      
      // Check if orientation is required and completed for Food Handlers (Yellow Card)
      const jobCategoryName = data?.jobCategoryName?.toLowerCase();
      const requiresOrientation = jobCategoryName?.includes('yellow card') || jobCategoryName?.includes('food');
      
      if (newStatus === 'Approved' && requiresOrientation) {
        if (!orientationDetails) {
          throw new Error("This application requires orientation attendance. Please schedule an orientation first.");
        }
        if (orientationDetails.status !== 'completed') {
          const statusMessage = orientationDetails.status === 'scheduled' ? 
            'Orientation is scheduled but not yet completed.' :
            orientationDetails.status === 'checked-in' ?
            'Applicant is currently in orientation session.' :
            'Orientation status is pending.';
          throw new Error(`Cannot approve application. ${statusMessage} The applicant must complete the orientation before approval.`);
        }
      }
      
      if (newStatus === 'Rejected' && !data?.checklist.some((doc: ChecklistItem) => doc.status === 'Referred' || doc.status === 'NeedsRevision')) {
        throw new Error("To send notifications, at least one document must be flagged for revision or referred for medical management.");
      }

      await finalizeApplication({ applicationId: params.id, newStatus });
      
      // After document verification, application is complete
      // Payment should have already been validated before reaching this stage
      if (newStatus === 'Approved') {
        setSuccessMessage('Application approved and completed! Redirecting to dashboard...');
      } else {
        setSuccessMessage('Application rejected. Applicant has been notified.');
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (e: any) {
      // Clean up error message by removing Convex technical details
      let cleanMessage = e.message || 'An unexpected error occurred';
      
      // Remove Convex error prefix if present
      cleanMessage = cleanMessage.replace(/^\[CONVEX [^\]]+\]\s*/, '');
      cleanMessage = cleanMessage.replace(/Server Error\s+/, '');
      cleanMessage = cleanMessage.replace(/Uncaught Error:\s*/, '');
      
      setError({ title: "Orientation Required", message: cleanMessage });
    }
  };

  // Handler to open referral confirmation modal
  const handleSendReferralClick = async () => {
    if (pendingActions.length === 0) {
      setError({ title: "Validation Failed", message: "No pending actions to send. Please flag documents for revision or refer to doctor first." });
      return;
    }
    
    // Open confirmation modal
    setIsReferralConfirmModalOpen(true);
  };

  // Handler to confirm sending referral notifications
  const handleConfirmSendReferral = async () => {
    setIsReferralConfirmModalOpen(false);
    setError(null);
    
    try {
      // Save all pending actions to database
      for (const action of pendingActions) {
        if (action.actionType === 'refer_doctor') {
          // Medical referral
          await referDocumentMutation({
            documentUploadId: action.uploadId,
            issueType: "medical_referral",
            medicalReferralCategory: "other_medical_concern",
            referralReason: action.reason,
            specificIssues: action.notes.split(',').map(s => s.trim()).filter(s => s),
            doctorName: action.doctorName || "Dr. TBD",
            clinicAddress: "Door 7, Magsaysay Complex, Magsaysay Park, Davao City",
          });
        } else {
          // Document quality issue
          await referDocumentMutation({
            documentUploadId: action.uploadId,
            issueType: "document_issue",
            documentIssueCategory: action.category as any,
            referralReason: action.reason,
            specificIssues: action.notes.split(',').map(s => s.trim()).filter(s => s),
          });
        }
      }
      
      // Clear pending actions after successful save
      setPendingActions([]);
      
      // Reload data to show updated statuses
      await loadData();
      
      // Call finalizeApplication to send notifications
      await handleFinalize('Rejected');
      
      setSuccessMessage(`Successfully sent ${pendingActions.length} notification(s) to applicant.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setError(createAppError(e.message, 'Failed to send notifications'));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
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
              <div className="bg-gradient-to-br from-teal-400 to-emerald-500 px-6 py-5">
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
                    {/* Application ID - Prominent display for venue staff */}
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200">
                      <svg className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1 block">🎫 Application ID</label>
                        <p className="text-lg font-mono font-bold text-gray-900 tracking-wide mb-1">#{params.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-teal-700 italic">Have applicant show this ID at venue for in-person verification</p>
                      </div>
                    </div>
                    
                    {/* First Name */}
                    {data.applicantDetails?.firstName && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            
            {/* Collapsible Payment Details Card - Only show for 3rd party payments (Maya, Gcash) */}
            {paymentData && (paymentData.paymentMethod === 'Maya' || paymentData.paymentMethod === 'Gcash') && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsPaymentDetailsExpanded(!isPaymentDetailsExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={isPaymentDetailsExpanded}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-800">Payment Details</h2>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isPaymentDetailsExpanded ? 'rotate-180' : ''
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
                    isPaymentDetailsExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2 space-y-3 border-t border-gray-100">
                    {/* Amount */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">₱{(paymentData.amount ?? 0).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Payment Method */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</label>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.paymentMethod}</p>
                      </div>
                    </div>
                    
                    {/* Transaction Date */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction Date</label>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{new Date(paymentData.submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    
                    {/* Payment Status */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{paymentData.paymentStatus}</p>
                      </div>
                    </div>
                    
                    {/* Reference Number */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference Number</label>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 font-mono">{paymentData.referenceNumber}</p>
                      </div>
                    </div>
                    
                    {/* Maya Checkout ID - Only show if payment method is Maya */}
                    {paymentData.paymentMethod === 'Maya' && paymentData.mayaCheckoutId && (
                      <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
                        <svg className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Maya Checkout ID</label>
                          <p className="text-sm font-medium text-teal-900 mt-0.5 font-mono break-all">{paymentData.mayaCheckoutId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Collapsible Orientation Details Card - Only show for Food Handlers (Yellow Card) */}
            {(data.jobCategoryName?.toLowerCase().includes('yellow card') || data.jobCategoryName?.toLowerCase().includes('food')) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsOrientationDetailsExpanded(!isOrientationDetailsExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={isOrientationDetailsExpanded}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h2 className="text-base font-bold text-gray-800">Orientation Details</h2>
                    {orientationDetails && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        orientationDetails.status === 'completed' 
                          ? 'bg-green-100 text-green-700'
                          : orientationDetails.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : orientationDetails.status === 'checked-in'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {orientationDetails.status === 'completed' ? '✅ Completed' :
                         orientationDetails.status === 'scheduled' ? '📅 Scheduled' :
                         orientationDetails.status === 'checked-in' ? '🏃 In Progress' :
                         orientationDetails.status === 'missed' ? '❌ Missed' :
                         'Not Scheduled'}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isOrientationDetailsExpanded ? 'rotate-180' : ''
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
                    isOrientationDetailsExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    {orientationDetails ? (
                      <div className="space-y-3">
                        {/* Status Badge */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                            <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">
                              {orientationDetails.status === 'checked-in' ? 'In Progress' : orientationDetails.status}
                            </p>
                          </div>
                        </div>
                        
                        {/* Scheduled Date */}
                        {orientationDetails.scheduledDate && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled Date</label>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">
                                {new Date(orientationDetails.scheduledDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  timeZone: 'Asia/Manila'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Time Slot */}
                        {orientationDetails.scheduledTime && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Slot</label>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">{orientationDetails.scheduledTime}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Venue */}
                        {orientationDetails.venue && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Venue</label>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">
                                {orientationDetails.venue.name}
                                {orientationDetails.venue.address && (
                                  <span className="block text-xs text-gray-500 mt-1">{orientationDetails.venue.address}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Instructor */}
                        {orientationDetails.instructor && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Instructor</label>
                              <p className="text-sm font-medium text-gray-900 mt-0.5">
                                {orientationDetails.instructor.name}
                                {orientationDetails.instructor.designation && (
                                  <span className="text-xs text-gray-500 ml-2">({orientationDetails.instructor.designation})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Check-in Time */}
                        {orientationDetails.checkInTime && (
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">Check-in Time</label>
                              <p className="text-sm font-medium text-green-900 mt-0.5">
                                {new Date(orientationDetails.checkInTime).toLocaleString('en-US', { 
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Manila'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Check-out Time */}
                        {orientationDetails.checkOutTime && (
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">Check-out Time</label>
                              <p className="text-sm font-medium text-green-900 mt-0.5">
                                {new Date(orientationDetails.checkOutTime).toLocaleString('en-US', { 
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Manila'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Duration (if completed) */}
                        {orientationDetails.checkInTime && orientationDetails.checkOutTime && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Duration</label>
                              <p className="text-sm font-medium text-blue-900 mt-0.5">
                                {Math.round((orientationDetails.checkOutTime - orientationDetails.checkInTime) / 60000)} minutes
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-2">No Orientation Scheduled</p>
                        <p className="text-gray-400 text-xs">This Food Handler application requires orientation attendance.</p>
                        <p className="text-gray-400 text-xs mt-1">The applicant needs to schedule an orientation session.</p>
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
                // Count pending actions from local state
                const referredCount = pendingActions.filter(action => action.actionType === 'refer_doctor').length;
                const needsRevisionCount = pendingActions.filter(action => action.actionType === 'flag_revision').length;
                const totalPending = pendingActions.length;
                const totalDocs = data?.checklist.length || 0;
                
                if (totalPending > 0) {
                  // Show appropriate warning based on pending count
                  const warningLevel = totalPending > 3 ? 'severe' : totalPending >= 2 ? 'warning' : 'info';
                  const bgColor = warningLevel === 'severe' ? 'bg-red-50 border-red-300' : warningLevel === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
                  const textColor = warningLevel === 'severe' ? 'text-red-800' : warningLevel === 'warning' ? 'text-orange-800' : 'text-blue-800';
                  const iconColor = warningLevel === 'severe' ? 'text-red-600' : warningLevel === 'warning' ? 'text-orange-600' : 'text-blue-600';
                  
                  return (
                    <div className={`mb-4 ${bgColor} border rounded-lg p-3`}>
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${iconColor} mt-0.5 shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={`text-sm ${textColor}`}>
                          <p className="font-semibold mb-1">
                            {warningLevel === 'severe' ? '⚠️ High Issue Rate' : 'Pending Applicant Notifications'} ({totalPending} of {totalDocs})
                          </p>
                          <p className={warningLevel === 'severe' ? 'text-red-700' : warningLevel === 'warning' ? 'text-orange-700' : 'text-blue-700'}>
                            {warningLevel === 'severe'
                              ? `More than 3 documents require attention (${totalPending}/${totalDocs}). Please review before sending notifications.`
                              : totalPending === 1
                              ? '1 document requires applicant action. Click "Send Applicant Notifications" to proceed.'
                              : `${totalPending} document(s) require applicant action`
                            }
                            {(referredCount > 0 || needsRevisionCount > 0) && totalPending > 1 && (
                              <span className="block mt-1 text-xs">
                                {referredCount > 0 && `🏥 ${referredCount} Medical Referral${referredCount > 1 ? 's' : ''}`}
                                {referredCount > 0 && needsRevisionCount > 0 && ' • '}
                                {needsRevisionCount > 0 && `📄 ${needsRevisionCount} Document Revision${needsRevisionCount > 1 ? 's' : ''}`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="flex flex-col gap-3">
                {/* Primary Action: Approve - Only show if not already complete */}
                {applicationStatus?.applicationStatus !== 'Complete' && (
                  <button 
                    onClick={() => handleFinalize('Approved')} 
                    className="group w-full bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-teal-500 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {/* Payment should already be validated before reaching this page */}
                    {/* This is the final step - approving documents completes the application */}
                    Approve Application
                  </button>
                )}
                
                {/* Show completion status if already complete */}
                {applicationStatus?.applicationStatus === 'Complete' && (
                  <div className="w-full bg-emerald-50 border-2 border-emerald-200 px-6 py-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-emerald-900 text-sm">Application Complete</p>
                      <p className="text-emerald-700 text-xs mt-0.5">This application has been fully approved</p>
                    </div>
                  </div>
                )}
                
                {/* Secondary Action: Send Referral Notification */}
                <button 
                  onClick={handleSendReferralClick} 
                  className="group w-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Applicant Notifications
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
                          {(() => {
                            const effectiveStatus = getEffectiveStatus(item);
                            const pendingAction = getPendingAction(item.uploadId);
                            
                            if (effectiveStatus === 'Approved') {
                              return (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              );
                            } else if (effectiveStatus === 'Referred') {
                              return (
                                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                              );
                            } else if (effectiveStatus === 'NeedsRevision') {
                              return (
                                <div className="w-6 h-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <h3 className="font-bold text-gray-800 text-base">
                            {item.requirementName}
                            {item.isRequired && <span className="text-rose-500 ml-1">*</span>}
                            
                            {/* ATTEMPT COUNTER BADGE - Only show if there have been rejections */}
                            {(item.attemptNumber ?? 0) > 0 && (
                              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-md ${
                                item.attemptNumber === 1 ? 'bg-gray-100 text-gray-600' :
                                item.attemptNumber === 2 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                item.attemptNumber === 3 ? 'bg-orange-100 text-orange-700 border border-orange-400' :
                                'bg-red-100 text-red-700 border border-red-400'
                              }`}>
                                {item.maxAttemptsReached ? '🔒 Manual Review Required' : 
                                 item.attemptNumber === 3 ? `⚠️ Attempt #${item.attemptNumber} (FINAL)` :
                                 item.attemptNumber === 2 ? `⚠️ Attempt #${item.attemptNumber}` :
                                 `Attempt #${item.attemptNumber}`}
                              </span>
                            )}
                          </h3>
                          {getPendingAction(item.uploadId) && (
                            <span className="text-xs font-medium text-gray-500 ml-2">⏳ Pending</span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={getEffectiveStatus(item)} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                    </div>
                  </div>
                  
                  {openReferralIndex === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 -m-4 p-4 rounded-b-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {modalType === 'refer_doctor' ? '🏥 Refer to Doctor' : '📄 Flag for Revision'} for "{item.requirementName}"
                      </h4>
                      <div className="space-y-4">
                        {/* Doctor Name Field - Only when referring to doctor */}
                        {modalType === 'refer_doctor' && (
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
          <label htmlFor={`issue-category-${idx}`} className="block text-sm font-medium text-gray-700">Issue Category</label>
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
            {modalType === 'refer_doctor' ? 'Medical Referral Reason' : 'Document Issue Reason'} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 space-y-2">
            {(modalType === 'refer_doctor' ? medicalReferralReasons : nonMedicalIssueOptions).map(option => (
              <label key={option} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <input type="radio" name={`remark-${idx}`} value={option} checked={referralReason === option} onChange={(e) => setReferralReason(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
                        <div>
                          <label htmlFor={`specific-issues-${idx}`} className="block text-sm font-medium text-gray-700">
                            Additional Details (Optional)
                          </label>
                          <textarea
                            id={`specific-issues-${idx}`}
                            name={`specific-issues-${idx}`}
                            rows={3}
                            value={specificIssues}
                            onChange={(e) => setSpecificIssues(e.target.value)}
                            className="mt-1 text-black block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder={modalType === 'refer_doctor'
                              ? "Auto-filled referral message. You may add additional notes here." 
                              : "e.g., Photo is blurry, Document is expired, Signature does not match"}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-3 mt-4">
                        {/* Remove button - only show if there's a pending action */}
                        {getPendingAction(item.uploadId) && (
                          <button onClick={() => {
                            // Remove pending action
                            setPendingActions(pendingActions.filter(action => action.uploadId !== item.uploadId));
                            setOpenReferralIndex(null);
                            setModalType(null);
                            setReferralReason('');
                            setSpecificIssues('');
                            setSuccessMessage('Pending action removed.');
                            setTimeout(() => setSuccessMessage(null), 2000);
                          }} className="bg-red-100 text-red-700 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-red-200 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                          <button onClick={() => {
                            setOpenReferralIndex(null);
                            setModalType(null);
                            setReferralReason('');
                            setSpecificIssues('');
                          }} className="bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-300">Cancel</button>
                        <button onClick={() => {
                          try {
                            // Validate referral reason
                            if (!referralReason) throw new Error('Please select a reason before saving.');

                            // Remove existing pending action for this document if any
                            const updatedPending = pendingActions.filter(action => action.uploadId !== item.uploadId);
                            
                            // Add new pending action
                            const newAction = {
                              uploadId: item.uploadId!,
                              actionType: modalType!,
                              category: issueCategory,
                              reason: referralReason,
                              notes: specificIssues,
                              doctorName: modalType === 'refer_doctor' ? FIXED_DOCTOR_NAME : undefined,
                              documentName: item.requirementName,
                            };
                            
                            setPendingActions([...updatedPending, newAction]);
                            
                            // Close modal and reset form
                            setOpenReferralIndex(null);
                            setModalType(null);
                            setReferralReason('');
                            setIssueCategory('other');
                            setSpecificIssues('');
                            setError(null);
                            
                            // Show success message
                            setSuccessMessage(
                              modalType === 'refer_doctor' 
                                ? `Referral to doctor added to queue. Click "Send Applicant Notifications" to finalize.`
                                : `Document flagged for revision. Click "Send Applicant Notifications" to finalize.`
                            );
                            setTimeout(() => setSuccessMessage(null), 3000);
                          } catch (e: any) {
                            setError(createAppError(e.message, 'Validation Error'));
                          }
                        }} className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700">
                          {modalType === 'refer_doctor' ? 'Save Referral' : 'Save & Flag for Revision'}
                        </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Review Required State - Show when max attempts reached */}
                  {item.maxAttemptsReached ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3 text-red-700">
                          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">🔒 Manual Review Required</p>
                            <p className="text-red-600 text-xs mt-1">
                              Max attempts reached ({item.attemptNumber} attempts). Applicant must visit venue for in-person verification.
                            </p>
                            <div className="mt-2 pt-2 border-t border-red-200 text-xs space-y-1">
                              <p>🏛️ <span className="font-medium">Venue:</span> City Health Office, Magsaysay Park Complex, Door 7</p>
                              <p>⏰ <span className="font-medium">Hours:</span> Monday-Friday, 8:00 AM–5:00 PM</p>
                              <p>☎️ <span className="font-medium">Contact:</span> 0926-686-1531</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Approve Button - Only show Approve for manual review */}
                      <div className="mt-3">
                        <button 
                          onClick={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} 
                          disabled={!item.uploadId || item.status === 'Approved'} 
                          className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-emerald-600 disabled:border-gray-200 flex items-center justify-center gap-2 shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item.status === 'Approved' ? 'Already Approved' : 'Approve After In-Person Verification'}
                        </button>
                        {item.status !== 'Approved' && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            ✓ Verify applicant brought original documents to venue before approving
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Normal State - Show flag/refer buttons */
                    /* Medical docs: 3 buttons (Approve + Flag for Revision + Refer to Doctor) */
                    /* Non-medical docs: 2 buttons (Approve + Flag for Revision) */
                    <div className={`mt-4 pt-4 border-t border-gray-100 ${isMedicalDocument(item.fieldIdentifier) ? 'grid grid-cols-1 sm:grid-cols-3 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-2'}`}>
                      {/* Approve Button - Disabled when waiting for resubmission or doctor clearance */}
                      <button 
                      onClick={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} 
                      disabled={!item.uploadId || item.status === 'Approved' || item.status === 'NeedsRevision' || item.status === 'Referred'} 
                      className="w-full bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-emerald-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    
                    {/* Flag for Revision Button - Always show for all documents */}
                    <button
                      onClick={() => {
                        const pending = getPendingAction(item.uploadId);
                        if (pending) {
                          // Load existing pending action for editing
                          setModalType(pending.actionType);
                          setIssueCategory(pending.category);
                          setReferralReason(pending.reason);
                          setSpecificIssues(pending.notes);
                        } else {
                          // New action
                          setModalType('flag_revision');
                          setIssueCategory('other');
                          setReferralReason('');
                          setSpecificIssues('');
                        }
                        setOpenReferralIndex(idx);
                      }}
                      disabled={!item.uploadId || item.status === 'Approved' || item.status === 'Referred' || item.status === 'NeedsRevision'}
                      className="w-full bg-orange-50 text-orange-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-orange-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Flag for Revision
                    </button>
                    
                    {/* Refer to Doctor Button - Only for medical documents */}
                    {isMedicalDocument(item.fieldIdentifier) && (
                      <button
                        onClick={() => {
                          setOpenReferralIndex(idx);
                          setModalType('refer_doctor');
                          setIssueCategory('other');
                          setReferralReason('Other medical concern');
                          setSpecificIssues(`Failed Medical Result (${item.requirementName}) - Please refer to ${FIXED_DOCTOR_NAME} at Door 7, Magsaysay Complex, Magsaysay Park, Davao City.`);
                        }}
                        disabled={!item.uploadId || item.status === 'Approved' || item.status === 'Referred' || item.status === 'NeedsRevision'}
                        className="w-full bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all border border-blue-100 disabled:border-gray-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Refer to Doctor
                      </button>
                    )}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Send Applicant Notifications?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The applicant will be notified about document issues that require their action.
            </p>
            
            {(() => {
              const referredCount = pendingActions.filter(action => action.actionType === 'refer_doctor').length;
              const needsRevisionCount = pendingActions.filter(action => action.actionType === 'flag_revision').length;
              const totalPending = pendingActions.length;
              
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    📧 {totalPending === 1 
                      ? '1 notification will be sent to the applicant.'
                      : `${totalPending} notifications will be sent to the applicant.`
                    }
                  </p>
                  {referredCount > 0 && (
                    <p className="text-xs text-blue-700 mt-1">
                      🏥 {referredCount} Medical Referral{referredCount > 1 ? 's' : ''}: Applicant will consult with doctor
                    </p>
                  )}
                  {needsRevisionCount > 0 && (
                    <p className="text-xs text-orange-700 mt-1">
                      📄 {needsRevisionCount} Document Revision{needsRevisionCount > 1 ? 's' : ''}: Applicant will resubmit corrected documents
                    </p>
                  )}
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
