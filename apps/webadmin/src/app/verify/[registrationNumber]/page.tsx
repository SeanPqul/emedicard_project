"use client";

import { useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useParams } from "next/navigation";

export default function VerifyHealthCard() {
  const params = useParams();
  const registrationNumber = params.registrationNumber as string;

  const healthCard = useQuery(api.healthCards.getHealthCard.getByRegistration, {
    registrationNumber: decodeURIComponent(registrationNumber),
  });

  if (healthCard === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying health card...</p>
        </div>
      </div>
    );
  }

  if (!healthCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Health Card</h1>
          <p className="text-gray-600">
            The health card with registration number <strong>{registrationNumber}</strong> was not found in our system.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Please contact the Davao City Health Office if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isValid = healthCard.status === "active" && !healthCard.isExpired;
  const statusText = isValid ? "Valid" : healthCard.isExpired ? "Expired" : "Inactive";

  const headerBgClass = isValid 
    ? "bg-green-600" 
    : healthCard.isExpired 
    ? "bg-red-600" 
    : "bg-yellow-600";

  const statusColorClass = isValid 
    ? "text-green-600" 
    : healthCard.isExpired 
    ? "text-red-600" 
    : "text-yellow-600";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`${headerBgClass} text-white p-6 text-center`}>
            <div className="flex justify-center mb-4">
              {isValid ? (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold">Health Card Verification</h1>
            <p className="text-xl mt-2">{statusText}</p>
          </div>

          {/* Card Details */}
          <div className="p-6 space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase">Card Holder</h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">{healthCard.applicantName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                <p className="text-lg font-semibold text-gray-900 mt-1">{healthCard.registrationNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className={`text-lg font-semibold mt-1 ${statusColorClass}`}>
                  {statusText}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Issue Date</h3>
                <p className="text-lg text-gray-900 mt-1">{formatDate(healthCard.issuedDate)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                <p className="text-lg text-gray-900 mt-1">{formatDate(healthCard.expiryDate)}</p>
              </div>
            </div>

            {healthCard.jobCategory && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Job Category</h3>
                <p className="text-lg text-gray-900 mt-1">{healthCard.jobCategory.name}</p>
              </div>
            )}
          </div>

          {/* Verification Notice */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Official Health Card</p>
                <p>This health card has been issued by the Davao City Health Office. 
                   {isValid ? " It is currently valid and active." : " Please note the status above."}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Davao City Health Office</p>
            <p className="mt-1">For inquiries, please contact your local health office.</p>
          </div>
        </div>

        {/* Additional Info */}
        {!isValid && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Card Not Valid</p>
                <p>This health card is {healthCard.isExpired ? "expired" : "inactive"}. 
                   The card holder should renew or reactivate their health card at the Davao City Health Office.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
