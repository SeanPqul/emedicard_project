// src/app/dashboard/payment-history/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import Navbar from '@/components/shared/Navbar';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorMessage from '@/components/ErrorMessage';
import { api } from '@backend/convex/_generated/api';

type PaymentRecord = {
  _id: string;
  _creationTime: number;
  amount: number;
  netAmount: number;
  serviceFee: number;
  paymentMethod: string;
  paymentLocation?: string;
  paymentStatus: string;
  referenceNumber: string;
  mayaCheckoutId?: string;
  mayaPaymentId?: string;
  receiptUrl?: string;
  updatedAt?: number;
  settlementDate?: number;
  applicationId: string;
  applicationStatus: string;
  applicationType: string;
  userId: string;
  userFullname: string;
  userEmail: string;
  userPhone?: string;
  jobCategoryName: string;
  jobCategoryColor?: string;
  rejectionCount: number;
  isOrphaned?: boolean;
};

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  
  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Data fetching
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  const payments = useQuery(api.payments.getAllPayments.get, {
    status: statusFilter || undefined,
    paymentMethod: methodFilter || undefined,
    startDate: dateRange.start ? new Date(dateRange.start).getTime() : undefined,
    endDate: dateRange.end ? new Date(dateRange.end).getTime() : undefined,
  });
  const stats = useQuery(api.payments.getAllPayments.getStats);

  // Filter payments by search
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    return payments.filter((payment) => {
      const searchLower = search.toLowerCase();
      return (
        payment.userFullname.toLowerCase().includes(searchLower) ||
        payment.userEmail.toLowerCase().includes(searchLower) ||
        payment.referenceNumber.toLowerCase().includes(searchLower) ||
        payment.jobCategoryName.toLowerCase().includes(searchLower) ||
        payment.mayaPaymentId?.toLowerCase().includes(searchLower) ||
        payment.mayaCheckoutId?.toLowerCase().includes(searchLower)
      );
    });
  }, [payments, search]);

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredPayments || filteredPayments.length === 0) return;

    const headers = [
      'Date',
      'Reference Number',
      'Applicant Name',
      'Email',
      'Job Category',
      'Payment Method',
      'Payment Location',
      'Status',
      'Amount',
      'Processing Fee',
      'Net Amount',
      'Maya Payment ID',
      'Application Status',
    ];

    const rows = filteredPayments.map((p) => [
      new Date(p._creationTime).toLocaleDateString('en-US'),
      p.referenceNumber,
      p.userFullname,
      p.userEmail,
      p.jobCategoryName,
      p.paymentMethod,
      p.paymentLocation || 'N/A',
      p.paymentStatus,
      `₱${p.amount.toFixed(2)}`,
      `₱${p.serviceFee.toFixed(2)}`,
      `₱${p.netAmount.toFixed(2)}`,
      p.mayaPaymentId || 'N/A',
      p.applicationStatus,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      Complete: 'bg-green-100 text-green-800 ring-green-600/20',
      Pending: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
      Processing: 'bg-blue-100 text-blue-800 ring-blue-600/20',
      Failed: 'bg-red-100 text-red-800 ring-red-600/20',
      Refunded: 'bg-purple-100 text-purple-800 ring-purple-600/20',
      Cancelled: 'bg-gray-100 text-gray-800 ring-gray-600/20',
      Expired: 'bg-orange-100 text-orange-800 ring-orange-600/20',
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  };

  const getMethodBadgeClass = (method: string) => {
    const classes = {
      Gcash: 'bg-blue-100 text-blue-800',
      Maya: 'bg-teal-100 text-teal-800',
      BaranggayHall: 'bg-emerald-100 text-emerald-800',
      CityHall: 'bg-purple-100 text-purple-800',
    };
    return classes[method as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  // Loading state
  if (!adminPrivileges || payments === undefined || stats === undefined) {
    return <LoadingScreen title="Loading Payment History" message="Fetching payment records..." />;
  }

  // Access control
  if (!adminPrivileges.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage 
          title="Access Denied" 
          message="You do not have permission to view payment history." 
          onCloseAction={() => router.push('/dashboard')} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-[1800px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/80 transition-all shadow-sm"
            aria-label="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-600 mt-1">Comprehensive record of all payment transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div className="text-sm text-gray-600 font-medium">Total Payments</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-green-200">
            <div className="text-sm text-green-700 font-medium">Completed</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-yellow-200">
            <div className="text-sm text-yellow-700 font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-red-200">
            <div className="text-sm text-red-700 font-medium">Failed</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-emerald-200">
            <div className="text-sm text-emerald-700 font-medium">Total Revenue</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-xs text-emerald-600 mt-0.5">Gross amount collected</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
            <div className="text-sm text-purple-700 font-medium">Net Revenue</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(stats.totalNetAmount)}</div>
            <div className="text-xs text-purple-600 mt-0.5">After processing fees</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-orange-200">
            <div className="text-sm text-orange-700 font-medium">Processing Fees</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(stats.totalServiceFees)}</div>
            <div className="text-xs text-orange-600 mt-0.5">Processing charges</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, email, reference number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Method Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Methods</option>
                <option value="Maya">Maya</option>
                <option value="BaranggayHall">Baranggay Hall</option>
                <option value="CityHall">City Hall</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={filteredPayments.length === 0}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredPayments.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{payments?.length || 0}</span> payments
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Reference</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Applicant</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Job Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No payments found</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(payment._creationTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-semibold text-gray-900">{payment.referenceNumber}</div>
                      {payment.rejectionCount > 0 && (
                        <span className="text-xs text-orange-600 font-medium">Rejected {payment.rejectionCount}x</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{payment.userFullname}</div>
                          <div className="text-xs text-gray-500">{payment.userEmail}</div>
                        </div>
                        {payment.isOrphaned && (
                          <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full" title="Application or user data deleted">
                            Orphaned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{payment.jobCategoryName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getMethodBadgeClass(payment.paymentMethod)}`}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.paymentLocation ? (
                        <span className="text-sm text-gray-700">{payment.paymentLocation}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-gray-500">Net: {formatCurrency(payment.netAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ring-2 ${getStatusBadgeClass(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Payment Details Modal */}
      {isDetailsModalOpen && selectedPayment && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-5 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Reference: {selectedPayment.referenceNumber}</p>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Payment Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Base Fee</label>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Total Amount</label>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayment.netAmount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Processing Fee</label>
                    <p className="text-sm text-gray-700">
                      {formatCurrency(selectedPayment.serviceFee || (selectedPayment.netAmount - selectedPayment.amount))}
                      {!selectedPayment.serviceFee && selectedPayment.netAmount !== selectedPayment.amount && (
                        <span className="text-xs text-orange-600 ml-1">(calculated)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Payment Method</label>
                    <p className="text-sm text-gray-700">{selectedPayment.paymentMethod}</p>
                  </div>
                  {selectedPayment.paymentLocation && (selectedPayment.paymentMethod === 'BaranggayHall' || selectedPayment.paymentMethod === 'CityHall') && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase">Payment Location</label>
                      <p className="text-sm text-gray-700">{selectedPayment.paymentLocation}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Status</label>
                    <p>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadgeClass(selectedPayment.paymentStatus)}`}>
                        {selectedPayment.paymentStatus}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Date</label>
                    <p className="text-sm text-gray-700">{formatDate(selectedPayment._creationTime)}</p>
                  </div>
                  {selectedPayment.mayaPaymentId && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Maya Payment ID</label>
                      <p className="text-sm text-gray-700 font-mono">{selectedPayment.mayaPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicant Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                    <p className="text-sm text-gray-700">{selectedPayment.userFullname}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                    <p className="text-sm text-gray-700">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Job Category</label>
                    <p className="text-sm text-gray-700">{selectedPayment.jobCategoryName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Application Status</label>
                    <p className="text-sm text-gray-700">{selectedPayment.applicationStatus}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => {
                    // Route to the correct page based on payment status
                    const route = selectedPayment.paymentStatus === 'Pending'
                      ? `/dashboard/${selectedPayment.applicationId}/payment_validation`
                      : `/dashboard/${selectedPayment.applicationId}/doc_verif`;
                    router.push(route);
                  }}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {selectedPayment.paymentStatus === 'Pending' ? 'Validate Payment' : 'View Full Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
