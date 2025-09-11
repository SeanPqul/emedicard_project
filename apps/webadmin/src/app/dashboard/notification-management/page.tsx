'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CustomUserButton from '@/components/CustomUserButton';
import ErrorMessage from '@/components/ErrorMessage';

// Mock Error Handling Util
interface AppError { title: string; message: string; }
const createAppError = (message: string, title: string = 'Validation Error'): AppError => ({ title, message });

// --- Data for the Page ---
const notificationTemplates = [
  { type: 'Incomplete Requirements', description: 'Your application is missing some required documents.', icon: ( <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> ) },
  { type: 'Payment Rejected', description: 'There was an issue with your payment. Please contact support or try again.', icon: ( <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg> ) },
  { type: 'Health Card Approved', description: 'Your health card application has been approved.', icon: ( <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ) },
  { type: 'Food Orientation Reminder', description: 'Reminder: You have an orientation scheduled today.', icon: ( <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> ) },
];

// Dummy data source for all applicants that the live search will filter
const allApplicants = [
  { id: 1, name: 'KenKen Gwapo' },
  { id: 2, name: 'Maria Clara' },
  { id: 3, name: 'Sean Maynard' },
  { id: 4, name: 'Caasi John' },
  { id: 5, name: 'Kenji Anthony' },
  { id: 6, name: 'Sheena Alivio' },
];

// This is the main component that contains all the logic.
function NotificationManagementComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- State Management ---
  const [applicantSearch, setApplicantSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [error, setError] = useState<AppError | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{ type: string; message?: string } | null>(null);

  // State for the live search feature
  const [searchResults, setSearchResults] = useState<{ id: number; name: string; }[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: number; name: string; } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- Logic ---
  useEffect(() => {
    const applicantFromUrl = searchParams.get('applicant');
    if (applicantFromUrl) {
      const decodedName = decodeURIComponent(applicantFromUrl);
      setApplicantSearch(decodedName);
      const foundApplicant = allApplicants.find(app => app.name === decodedName);
      if (foundApplicant) {
        setSelectedApplicant(foundApplicant);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (applicantSearch.trim() !== '' && isSearchFocused && !selectedApplicant) {
      const results = allApplicants.filter(app =>
        app.name.toLowerCase().includes(applicantSearch.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [applicantSearch, isSearchFocused, selectedApplicant]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  const handleSelectApplicant = (applicant: { id: number; name: string; }) => {
    setSelectedApplicant(applicant);
    setApplicantSearch(applicant.name);
    setIsSearchFocused(false);
  };
  
  const filteredTemplates = notificationTemplates.filter(t => t.type.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase()));

  const handleOpenConfirmation = (type: string, message?: string) => {
    try {
      if (!selectedApplicant) {
        throw new Error("Please select a valid applicant from the search results before sending a notification.");
      }
      setError(null);
      setConfirmModalData({ type, message });
    } catch (e: any) {
      setError(createAppError(e.message));
    }
  };

  const handleSendNotification = () => {
    if (!confirmModalData || !selectedApplicant) return;
    const notificationContent = confirmModalData.type === 'Others' ? confirmModalData.message : confirmModalData.type;
    alert(`Sending "${notificationContent}" to ${selectedApplicant.name}`);
    console.log({ user: selectedApplicant, type: confirmModalData.type, message: notificationContent });
    setConfirmModalData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Standard Navbar --- */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </Link>
          <CustomUserButton />
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800" aria-label="Go back to dashboard"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <h1 className="text-3xl font-bold text-gray-800">Notification Management</h1>
        </div>

        {/* --- Applicant Search with Live Results --- */}
        <div className="relative mb-6" ref={searchContainerRef}>
          <label htmlFor="applicantSearch" className="block text-sm font-medium text-gray-700 mb-1">1. Find Applicant</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
            <input 
              id="applicantSearch" 
              type="text" 
              value={applicantSearch} 
              onChange={(e) => { setApplicantSearch(e.target.value); setSelectedApplicant(null); }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Start typing an applicant's name..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-emerald-500 focus:border-emerald-500" 
              autoComplete="off"
            />
          </div>
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border text-gray-800 border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <ul>
                {searchResults.map(applicant => (
                  <li key={applicant.id} onClick={() => handleSelectApplicant(applicant)} className="px-4 py-2 hover:bg-emerald-50 cursor-pointer">{applicant.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* --- Template Search Bar --- */}
        <div className="relative mb-8">
          <label htmlFor="templateSearch" className="block text-sm font-medium text-gray-700 mb-1">2. Find Notification Template</label>
          <input id="templateSearch" type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates (e.g., 'approved', 'payment')..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:ring-emerald-500 focus:border-emerald-500" />
          <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg></div>
        </div>

        {error && <ErrorMessage title={error.title} message={error.message} onCloseAction={() => setError(null)} />}

        {/* --- Notification Cards --- */}
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div key={template.type} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
              <div className="flex items-center gap-4">
                {template.icon}
                <div><h3 className="font-semibold text-gray-800">{template.type}</h3><p className="text-sm text-gray-500">{template.description}</p></div>
              </div>
              <button onClick={() => handleOpenConfirmation(template.type)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700 flex-shrink-0">Send</button>
            </div>
          ))}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="w-full">
                <h3 className="font-semibold text-gray-800">Others:</h3>
                <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Compose a custom message..." className="w-full mt-2 p-2 border border-gray-300 textrounded-lg text-sm text-black focus:ring-emerald-500 focus:border-emerald-500" rows={3} />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => handleOpenConfirmation('Others', customMessage)} className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700">Send</button>
            </div>
          </div>
        </div>
      </main>

      {/* --- Confirmation Modal --- */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Notification</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to send this notification to <span className="font-semibold text-gray-800">{selectedApplicant?.name}</span>?</p>
            <div className="bg-gray-50 p-4 rounded-lg border text-left">
              <p className="font-semibold">{confirmModalData.type}</p>
              <p className="text-sm text-gray-500">{confirmModalData.type === 'Others' ? confirmModalData.message : notificationTemplates.find(t => t.type === confirmModalData.type)?.description}</p>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => setConfirmModalData(null)} className="px-8 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSendNotification} className="px-8 py-2.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700">Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// This wrapper component is necessary to use `useSearchParams` in a page component.
export default function NotificationManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotificationManagementComponent />
    </Suspense>
  );
}