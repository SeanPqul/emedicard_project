// src/app/dashboard/[id]/doc_verif/page.tsx
'use client';

import ApplicantActivityLog from '@/components/ApplicantActivityLog';
import ErrorMessage from '@/components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import Navbar from '@/components/shared/Navbar';
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
    'Approved': 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
    'Rejected': 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20',
    'Pending': 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    'Missing': 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10',
  };
  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
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
  const router = useRouter();

  // --- DATA FETCHING ---
  const getDocumentsWithClassification = useAction(api.applications.getDocumentsWithClassification.get);
  const [data, setData] = useState<ApplicationData | null>(null);
  const reviewDocument = useMutation(api.admin.reviewDocument.review);
  const rejectDocumentMutation = useMutation(api.admin.documents.rejectDocument.rejectDocument);
  const finalizeApplication = useMutation(api.admin.finalizeApplication.finalize);

  const loadData = async () => {
    const result = await getDocumentsWithClassification({ id: params.id });
    setData(result);
  };

  useEffect(() => {
    loadData();
  }, [getDocumentsWithClassification, params.id]);

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
      loadData(); // Refresh data after status change
    }
  };

  // --- HANDLER FUNCTIONS ---
  const handleFinalize = async (newStatus: 'Approved' | 'Rejected') => {
    try {
      setError(null);
      const pendingDocs = data?.checklist.filter((doc: ChecklistItem) => doc.status === 'Missing' || doc.status === 'Pending');
      if (pendingDocs && pendingDocs.length > 0) {
        throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
      }
      if (newStatus === 'Rejected' && !data?.checklist.some((doc: ChecklistItem) => doc.status === 'Rejected')) {
        throw new Error("To reject the application, at least one document must be marked as 'Rejected'.");
      }

      await finalizeApplication({ applicationId: params.id, newStatus });
      setSuccessMessage(`Application has been successfully ${newStatus.toLowerCase()}.`);

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

  // --- RENDER ---
  if (data === undefined) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (data === null) return <div className="min-h-screen flex items-center justify-center">Application not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar>
        <ApplicantActivityLog applicantName={data.applicantName} applicationId={params.id} />
      </Navbar>

      <main className="max-w-screen-xl mx-auto py-8 px-6">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
            <p className="text-gray-600 mt-1">Review and validate the applicant's submitted documents.</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Applicant Info & Actions */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Applicant Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-semibold">{data.applicantName}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-500">Category</label>
                  <p className="text-gray-900 font-semibold">{data.jobCategoryName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Final Actions</h2>
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
              <div className="flex flex-col gap-3">
                <button onClick={() => handleFinalize('Approved')} className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105">Approve & Continue</button>
                <button onClick={() => handleFinalize('Rejected')} className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105">Reject Application</button>
              </div>
            </div>
          </div>

          {/* Right Column: Document Checklist */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Checklist</h2>
            <div className="space-y-4">
              {data.checklist.map((item, idx) => (
                <div key={item._id} className="border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <h3 className="font-semibold text-gray-800">{item.requirementName}{item.isRequired && <span className="text-red-500 ml-1">*</span>}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.fileUrl ? (
                        <>
                          <button onClick={() => setViewModalDocUrl(item.fileUrl)} className="text-sm bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">View Document</button>
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
                            className="text-sm bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Extract Text
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 px-4 py-2">Not Submitted</span>
                      )}
                      <button onClick={() => setOpenRemarkIndex(openRemarkIndex === idx ? null : idx)} disabled={!item.uploadId} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Add remark">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
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
                    <button onClick={() => item.uploadId && handleStatusChange(idx, item.uploadId, 'Approved')} disabled={!item.uploadId || item.status === 'Approved'} className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">Approve</button>
                    <button onClick={async () => {
                      try {
                        if (!item.uploadId) throw new Error("Document upload ID is missing.");
                        // Directly call rejectDocumentMutation with a default remark if no specific remark is selected
                        await rejectDocumentMutation({
                          documentUploadId: item.uploadId,
                          rejectionCategory: 'other', // Default category
                          rejectionReason: 'Document rejected by admin.', // Default reason
                          specificIssues: [],
                        });
                        setError(null);
                      } catch (e: any) {
                        setError(createAppError(e.message, 'Rejection Error'));
                      }
                    }} disabled={!item.uploadId || item.status === 'Rejected'} className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {/* The View Document Modal */}
      {viewModalDocUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewModalDocUrl(null)}>
          <div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Document Preview</h3>
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
          <div className="relative bg-white p-4 rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-gray-800 font-semibold mb-4">Extracted Text (OCR)</h3>
            <div className="w-full h-[calc(100%-80px)] bg-gray-100 p-3 rounded-md overflow-auto text-sm text-gray-800">
              {extractedText && extractedText.length > 0 ? (
                extractedText.map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <p>No text extracted or document is empty.</p>
              )}
            </div>
            <button onClick={() => setShowOcrModal(false)} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
