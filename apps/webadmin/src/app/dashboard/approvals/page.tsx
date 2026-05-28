"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useState, useEffect } from "react";
import Toast, { ToastType } from '@/components/shared/Toast';
import Navbar from '@/components/shared/Navbar';
import Link from 'next/link';

export default function ApprovalsPage() {
  const pendingUsers = useQuery(api.users.getPendingUsers.getPendingUsers);
  const updateStatus = useMutation(api.users.updateStatus.updateUserStatus);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  // Auto-select first user if none selected
  useEffect(() => {
    if (pendingUsers && pendingUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(pendingUsers[0]._id);
    }
  }, [pendingUsers, selectedUserId]);

  const handleStatusUpdate = async (userId: any, status: "approved" | "rejected") => {
    setProcessingId(userId);
    
    try {
      await updateStatus({ userId, status });
      showToast(`User ${status} successfully`, 'success');
      
      // Auto-select next user logic
      if (pendingUsers) {
        const currentIndex = pendingUsers.findIndex(u => u._id === userId);
        const nextUser = pendingUsers[currentIndex + 1] || pendingUsers[currentIndex - 1] || null;
        setSelectedUserId(nextUser ? nextUser._id : null);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast("Failed to update status. Please try again.", 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingUsers === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  const filteredUsers = pendingUsers.filter(u => 
    u.fullname.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = pendingUsers.find(u => u._id === selectedUserId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: User List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-4">
            <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">{filteredUsers.length}</span>
                Pending Approvals
              </h2>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search applicants..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No pending users found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedUserId === user._id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${selectedUserId === user._id ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                      {user.fullname.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-semibold truncate ${selectedUserId === user._id ? 'text-emerald-900' : 'text-gray-900'}`}>
                        {user.fullname}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(user.registrationSubmittedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Detail View */}
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
          {selectedUser ? (
            <ApprovalDetail 
              user={selectedUser} 
              isProcessing={processingId === selectedUser._id}
              onApprove={() => handleStatusUpdate(selectedUser._id, "approved")}
              onReject={() => handleStatusUpdate(selectedUser._id, "rejected")}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Select an applicant to review</p>
            </div>
          )}
        </div>
      </div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

function ApprovalDetail({ user, onApprove, onReject, isProcessing }: any) {
  const imageUrl = useQuery(api.storage.getUrl.getUrl, 
    user.registrationDocumentId ? { storageId: user.registrationDocumentId } : "skip"
  );

  // Helper function to get document type label
  const getDocumentTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'government_id':
        return 'Government-Issued ID';
      case 'previous_health_card':
        return 'Previous Health Card';
      case 'medical_certificate':
        return 'Medical Certificate';
      case 'other':
        return 'Other Supporting Document';
      default:
        return 'Verification Document';
    }
  };

  const documentTypeLabel = getDocumentTypeLabel(user.registrationDocumentType);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.fullname}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">{user.email}</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium uppercase">
              {user.role || 'applicant'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onReject}
            disabled={isProcessing}
            className="px-6 py-2.5 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : "Reject"}
          </button>
          <button 
            onClick={onApprove}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Approve User"}
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Document Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {documentTypeLabel}
                </h3>
                {user.registrationDocumentType && (
                  <p className="text-xs text-gray-500 ml-7 mt-1">
                    Document Type: {documentTypeLabel}
                  </p>
                )}
              </div>
              {imageUrl && (
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Open in new tab
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              )}
            </div>
            
            <div className="p-6 bg-gray-100 flex justify-center min-h-[400px]">
              {user.registrationDocumentId ? (
                imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={documentTypeLabel}
                    className="max-w-full max-h-[600px] object-contain shadow-md rounded bg-white"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                    <p>Loading document...</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <p>No document uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Submission Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Document Type</span>
                  <span className="text-gray-900 font-medium text-sm">
                    {documentTypeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Submitted At</span>
                  <span className="text-gray-900 font-medium text-sm">
                    {user.registrationSubmittedAt ? new Date(user.registrationSubmittedAt).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold uppercase">Pending Review</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Applicant Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Full Name</span>
                  <span className="text-gray-900 font-medium text-sm">{user.fullname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="text-gray-900 font-medium text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">User ID</span>
                  <span className="text-gray-500 font-mono text-xs truncate max-w-[150px]">{user._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
