// src/components/shared/LoadingScreen.tsx
import React from 'react';

interface LoadingScreenProps {
  title?: string;
  message?: string;
}

export default function LoadingScreen({ 
  title = "Loading", 
  message = "Please wait..." 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
