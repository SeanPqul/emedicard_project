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
  receiptUrl?: string | null;
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
  const { user, isLoaded } = useUser();
  
  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Data fetching - wait for authentication to be ready
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isLoaded && user ? undefined : "skip"
  );
  const payments = useQuery(
    api.payments.getAllPayments.get,
    isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
      ? {
          status: statusFilter || undefined,
          paymentMethod: methodFilter || undefined,
          startDate: dateRange.start ? new Date(dateRange.start).getTime() : undefined,
          endDate: dateRange.end ? new Date(dateRange.end).getTime() : undefined,
        }
      : "skip"
  );
  const stats = useQuery(
    api.payments.getAllPayments.getStats,
    isLoaded && user && adminPrivileges && adminPrivileges.isAdmin ? undefined : "skip"
  );

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

  // Export to Excel/CSV with Comprehensive Summary
  const exportToCSV = () => {
    if (!filteredPayments || filteredPayments.length === 0) return;

    // Calculate detailed statistics
    const totalBaseAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalProcessingFees = filteredPayments.reduce((sum, p) => sum + p.serviceFee, 0);
    const totalPaid = filteredPayments.reduce((sum, p) => sum + p.netAmount, 0);
    
    // Status breakdown
    const statusCounts = filteredPayments.reduce((acc, p) => {
      acc[p.paymentStatus] = (acc[p.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Payment method breakdown with totals
    const methodBreakdown = filteredPayments.reduce((acc, p) => {
      const method = p.paymentMethod === 'BaranggayHall' ? 'Baranggay Hall' : 
                     p.paymentMethod === 'CityHall' ? 'City Hall' : p.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, baseAmount: 0, fees: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].baseAmount += p.amount;
      acc[method].fees += p.serviceFee;
      acc[method].total += p.netAmount;
      return acc;
    }, {} as Record<string, { count: number; baseAmount: number; fees: number; total: number }>);

    // Build CSV content with sections
    const csvLines: string[] = [];
    const separator = '="' + '='.repeat(100) + '"';

    // ============ REPORT HEADER ============
    csvLines.push('EMEDICARD PAYMENT REPORT');
    csvLines.push('');
    csvLines.push(`Report Generated:,${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    csvLines.push(`Total Records:,${filteredPayments.length}`);
    
    // Applied filters
    if (statusFilter || methodFilter || dateRange.start || dateRange.end) {
      csvLines.push('');
      csvLines.push('FILTERS APPLIED');
      if (statusFilter) csvLines.push(`Status Filter:,${statusFilter}`);
      if (methodFilter) csvLines.push(`Method Filter:,${methodFilter === 'BaranggayHall' ? 'Baranggay Hall' : methodFilter === 'CityHall' ? 'City Hall' : methodFilter}`);
      if (dateRange.start) csvLines.push(`From Date:,${dateRange.start}`);
      if (dateRange.end) csvLines.push(`To Date:,${dateRange.end}`);
    }
    
    csvLines.push('');
    csvLines.push(separator);
    csvLines.push('');

    // ============ DETAILED TRANSACTIONS ============
    csvLines.push('PAYMENT TRANSACTIONS');
    csvLines.push('');
    
    const headers = [
      'Payment Date',
      'Payment Time',
      'Reference Number',
      'Applicant Name',
      'Email',
      'Phone',
      'Job Category',
      'Payment Method',
      'Payment Location',
      'Payment Status',
      'Base Amount',
      'Processing Fee',
      'Total Paid',
      'Maya Payment ID',
      'Application Status',
      'Rejection Count',
    ];
    csvLines.push(headers.join(','));

    filteredPayments.forEach((p) => {
      const date = new Date(p._creationTime);
      const row = [
        date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        p.referenceNumber,
        p.userFullname,
        p.userEmail,
        p.userPhone || 'N/A',
        p.jobCategoryName,
        p.paymentMethod === 'BaranggayHall' ? 'Baranggay Hall' : p.paymentMethod === 'CityHall' ? 'City Hall' : p.paymentMethod,
        p.paymentLocation || 'N/A',
        p.paymentStatus,
        p.amount.toFixed(2),
        p.serviceFee.toFixed(2),
        p.netAmount.toFixed(2),
        p.mayaPaymentId || 'N/A',
        p.applicationStatus,
        p.rejectionCount || 0,
      ];
      csvLines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    });

    // ============ FINANCIAL SUMMARY ============
    csvLines.push('');
    csvLines.push(separator);
    csvLines.push('');
    csvLines.push('FINANCIAL SUMMARY');
    csvLines.push('');
    csvLines.push(`Total Transactions:,${filteredPayments.length}`);
    csvLines.push(`Total Base Amount:,PHP ${totalBaseAmount.toFixed(2)}`);
    csvLines.push(`Total Processing Fees:,PHP ${totalProcessingFees.toFixed(2)}`);
    csvLines.push(`Total Amount Collected:,PHP ${totalPaid.toFixed(2)}`);
    csvLines.push(`Average Transaction:,PHP ${(totalPaid / filteredPayments.length).toFixed(2)}`);

    // ============ STATUS BREAKDOWN ============
    csvLines.push('');
    csvLines.push('STATUS BREAKDOWN');
    csvLines.push('Status,Count,Percentage');
    Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([status, count]) => {
        const percentage = ((count / filteredPayments.length) * 100).toFixed(1);
        csvLines.push(`${status},${count},${percentage}%`);
      });

    // ============ PAYMENT METHOD BREAKDOWN ============
    csvLines.push('');
    csvLines.push('PAYMENT METHOD BREAKDOWN');
    csvLines.push('Method,Transactions,Base Amount,Processing Fees,Total Collected');
    Object.entries(methodBreakdown)
      .sort(([, a], [, b]) => b.count - a.count)
      .forEach(([method, data]) => {
        csvLines.push(
          `${method},${data.count},PHP ${data.baseAmount.toFixed(2)},PHP ${data.fees.toFixed(2)},PHP ${data.total.toFixed(2)}`
        );
      });

    // ============ GRAND TOTALS ============
    csvLines.push('');
    csvLines.push(separator);
    csvLines.push('');
    csvLines.push('GRAND TOTALS');
    csvLines.push(`Total Records:,${filteredPayments.length}`);
    csvLines.push(`Total Base Amount:,PHP ${totalBaseAmount.toFixed(2)}`);
    csvLines.push(`Total Processing Fees:,PHP ${totalProcessingFees.toFixed(2)}`);
    csvLines.push(`TOTAL COLLECTED:,PHP ${totalPaid.toFixed(2)}`);
    csvLines.push('');
    csvLines.push(separator);
    csvLines.push('');
    csvLines.push(`Report End - Generated on ${new Date().toLocaleDateString('en-US')}`);

    // Create and download with UTF-8 BOM for Excel compatibility
    const csvContent = '\ufeff' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `Payments_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
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
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2.5 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-sm border border-gray-200 hover:border-emerald-300"
              aria-label="Back to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments</h1>
                  <p className="text-gray-600 mt-1">Comprehensive record of all payment transactions</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-4 mb-8">
          {/* Total Payments */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-600 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{stats.total}</div>
              <div className="text-xs font-medium text-gray-600">Total Payments</div>
            </div>
          </div>

          {/* Completed */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-green-200 hover:border-green-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-green-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-900 tracking-tight">{stats.completed}</div>
              <div className="text-xs font-medium text-green-700">Completed</div>
            </div>
          </div>

          {/* Pending */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-yellow-200 hover:border-yellow-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-yellow-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-900 tracking-tight">{stats.pending}</div>
              <div className="text-xs font-medium text-yellow-700">Pending</div>
            </div>
          </div>

          {/* Failed */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-red-200 hover:border-red-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-900 tracking-tight">{stats.failed}</div>
              <div className="text-xs font-medium text-red-700">Failed</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200 hover:border-emerald-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-900 tracking-tight">{formatCurrency(stats.totalAmount)}</div>
              <div className="text-xs font-medium text-emerald-700">Total Revenue</div>
              <div className="text-[10px] text-emerald-600">Gross collected</div>
            </div>
          </div>

          {/* Processing Fees */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-orange-200 hover:border-orange-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-orange-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-900 tracking-tight">{formatCurrency(stats.totalServiceFees)}</div>
              <div className="text-xs font-medium text-orange-700">Processing Fees</div>
              <div className="text-[10px] text-orange-600">Service charges</div>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-200 hover:border-purple-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-500 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-900 tracking-tight">{formatCurrency(stats.totalNetAmount)}</div>
              <div className="text-xs font-medium text-purple-700">Net Revenue</div>
              <div className="text-[10px] text-purple-600">After fees</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Filters & Search</h3>
            </div>
            
            {/* Single Row Layout */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="flex-1 lg:min-w-[300px]">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, reference..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="w-full lg:w-44">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* End Date */}
              <div className="w-full lg:w-44">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-44">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
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
              <div className="w-full lg:w-44">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">All Methods</option>
                  <option value="Maya">Maya</option>
                  <option value="BaranggayHall">Baranggay Hall</option>
                  <option value="CityHall">City Hall</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 lg:items-end">
                {(dateRange.start || dateRange.end || statusFilter || methodFilter || search) && (
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setStatusFilter('');
                      setMethodFilter('');
                      setSearch('');
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all border border-gray-300 flex items-center gap-2 whitespace-nowrap"
                    title="Clear all filters"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden xl:inline">Clear</span>
                  </button>
                )}
                <button
                  onClick={exportToCSV}
                  disabled={filteredPayments.length === 0}
                  className="px-4 lg:px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
                  title="Download as Excel file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden lg:inline">Download Report</span>
                  <span className="lg:hidden">Export</span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Showing <span className="font-semibold text-gray-900">{filteredPayments.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{payments?.length || 0}</span> payments
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b-2 border-emerald-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Job Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Commission</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
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
                  <tr key={payment._id} className="hover:bg-emerald-50/30 transition-all duration-200 group border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(payment._creationTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-mono font-bold text-gray-900">{payment.referenceNumber}</div>
                        {payment.rejectionCount > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-orange-600 font-semibold">Rejected {payment.rejectionCount}x</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0">
                          {payment.userFullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{payment.userFullname}</div>
                          <div className="text-xs text-gray-500 truncate">{payment.userEmail}</div>
                        </div>
                        {payment.isOrphaned && (
                          <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full shrink-0" title="Application or user data deleted">
                            Orphaned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">{payment.jobCategoryName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getMethodBadgeClass(payment.paymentMethod)}`}>
                        {payment.paymentMethod === 'BaranggayHall' ? 'Baranggay Hall' : payment.paymentMethod === 'CityHall' ? 'City Hall' : payment.paymentMethod}
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
                      <div className="flex flex-col gap-0.5">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-gray-500">Net: {formatCurrency(payment.netAmount)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-orange-600">{formatCurrency(payment.serviceFee)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatusBadgeClass(payment.paymentStatus)}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow group-hover:scale-105"
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Payment Details</h3>
                    <p className="text-sm text-emerald-100 mt-0.5 font-mono">{selectedPayment.referenceNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Payment Information */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-bold text-gray-900">Payment Information</h4>
                </div>
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h4 className="text-lg font-bold text-gray-900">Applicant Information</h4>
                </div>
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
              <div>
                <button
                  onClick={() => {
                    // Route to the correct page based on payment status
                    const route = selectedPayment.paymentStatus === 'Pending'
                      ? `/dashboard/${selectedPayment.applicationId}/payment_validation`
                      : `/dashboard/${selectedPayment.applicationId}/doc_verif`;
                    router.push(route);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
