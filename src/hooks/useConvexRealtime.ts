import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";

/**
 * Real-time hooks for Convex subscriptions
 * These hooks provide live updates for applications, notifications, and other data
 */

// Real-time notifications with unread count
export function useNotificationsRealtime() {
  const notifications = useQuery(api.notifications.getUserNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);
  const recentNotifications = useQuery(api.notifications.getRecentNotifications, { limit: 5 });

  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    recentNotifications: recentNotifications || [],
    markAsRead: (notificationId: Id<"notifications">) => markAsRead({ notificationId }),
    markAllAsRead: () => markAllAsRead({}),
    deleteNotification: (notificationId: Id<"notifications">) => deleteNotification({ notificationId }),
  };
}

// Real-time application status updates
export function useApplicationsRealtime() {
  const applications = useQuery(api.forms.getUserApplications);
  const createForm = useMutation(api.forms.createForm);
  const updateForm = useMutation(api.forms.updateForm);

  return {
    applications: applications || [],
    createForm,
    updateForm,
    isLoading: applications === undefined,
  };
}

// Real-time payment status updates
export function usePaymentsRealtime() {
  const payments = useQuery(api.payments.getUserPayments);
  const createPayment = useMutation(api.payments.createPayment);
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);
  const retryPayment = useMutation(api.payments.retryPayment);
  const logPaymentAttempt = useMutation(api.payments.logPaymentAttempt);

  return {
    payments: payments || [],
    createPayment,
    updatePaymentStatus,
    retryPayment,
    logPaymentAttempt,
    isLoading: payments === undefined,
  };
}

// Real-time health cards updates
export function useHealthCardsRealtime() {
  const healthCards = useQuery(api.healthCards.getUserHealthCards);
  const issueHealthCard = useMutation(api.healthCards.issueHealthCard);
  const updateHealthCard = useMutation(api.healthCards.updateHealthCard);

  return {
    healthCards: healthCards || [],
    issueHealthCard,
    updateHealthCard,
    isLoading: healthCards === undefined,
  };
}

// Real-time orientation updates
export function useOrientationsRealtime() {
  const orientations = useQuery(api.orientations.getUserOrientations);
  const createOrientation = useMutation(api.orientations.createOrientation);
  const checkIn = useMutation(api.orientations.updateOrientationCheckIn);
  const checkOut = useMutation(api.orientations.updateOrientationCheckOut);

  return {
    orientations: orientations || [],
    createOrientation,
    checkIn,
    checkOut,
    isLoading: orientations === undefined,
  };
}

// Real-time verification logs
export function useVerificationLogsRealtime() {
  const verificationLogs = useQuery(api.verificationLogs.getVerificationLogsByUser);
  const createVerificationLog = useMutation(api.verificationLogs.createVerificationLog);
  const logQRScan = useMutation(api.verificationLogs.logQRScan);
  const logVerificationAttempt = useMutation(api.verificationLogs.logVerificationAttempt);

  return {
    verificationLogs: verificationLogs || [],
    createVerificationLog,
    logQRScan,
    logVerificationAttempt,
    isLoading: verificationLogs === undefined,
  };
}

// Real-time document requirements
export function useDocumentRequirementsRealtime(formId?: Id<"forms">) {
  const requirements = useQuery(
    api.documentRequirements.getFormDocuments,
    formId ? { formId } : "skip"
  );
  const uploadDocument = useMutation(api.documentRequirements.uploadDocument);
  const updateDocument = useMutation(api.documentRequirements.updateDocument);
  const deleteDocument = useMutation(api.documentRequirements.deleteDocument);

  return {
    requirements,
    uploadDocument,
    updateDocument,
    deleteDocument,
    isLoading: requirements === undefined,
  };
}

// Enhanced error handling hook
export function useConvexErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      if (successMessage) {
        // You can integrate with a toast notification system here
        console.log(successMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Convex operation error:", errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    error,
    isLoading,
    handleAsyncOperation,
    clearError,
  };
}

// Real-time dashboard stats
export function useDashboardStatsRealtime() {
  const [stats, setStats] = useState({
    activeApplications: 0,
    pendingPayments: 0,
    pendingAmount: 0,
    validHealthCards: 0,
    unreadNotifications: 0,
  });

  const applications = useQuery(api.forms.getUserApplications);
  const payments = useQuery(api.payments.getUserPayments);
  const healthCards = useQuery(api.healthCards.getUserHealthCards);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);

  useEffect(() => {
    if (applications && payments && healthCards && unreadCount !== undefined) {
      const activeApps = applications.filter(app => 
        app.status === "Submitted" || app.status === "Under Review"
      ).length;

      const pendingPayments = payments.filter(payment => 
        payment.status === "Pending"
      ).length;

      const pendingAmount = payments
        .filter(payment => payment.status === "Pending")
        .reduce((sum, payment) => sum + payment.netAmount, 0);

      const validCards = healthCards.filter(card => 
        card.expiresAt > Date.now()
      ).length;

      setStats({
        activeApplications: activeApps,
        pendingPayments,
        pendingAmount,
        validHealthCards: validCards,
        unreadNotifications: unreadCount,
      });
    }
  }, [applications, payments, healthCards, unreadCount]);

  return {
    stats,
    isLoading: applications === undefined || payments === undefined || healthCards === undefined,
  };
}

// Real-time QR scanner with comprehensive logging
export function useQRScannerRealtime() {
  const logQRScan = useMutation(api.verificationLogs.logQRScan);
  const logVerificationAttempt = useMutation(api.verificationLogs.logVerificationAttempt);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanQRCode = async (
    verificationToken: string,
    scanLocation?: { latitude: number; longitude: number; address?: string },
    deviceInfo?: { platform: string; deviceId: string; appVersion: string }
  ) => {
    setIsScanning(true);
    setError(null);
    
    try {
      const result = await logQRScan({
        verificationToken,
        scanLocation,
        deviceInfo,
        userAgent: navigator.userAgent,
        ipAddress: undefined, // Would need to get from server
      });

      setScanResult(result);
      
      // Log successful attempt
      await logVerificationAttempt({
        verificationToken,
        success: true,
        userAgent: navigator.userAgent,
        ipAddress: undefined,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "QR scan failed";
      setError(errorMessage);
      
      // Log failed attempt
      await logVerificationAttempt({
        verificationToken,
        success: false,
        errorMessage,
        userAgent: navigator.userAgent,
        ipAddress: undefined,
      });

      throw err;
    } finally {
      setIsScanning(false);
    }
  };

  const clearScanResult = () => {
    setScanResult(null);
    setError(null);
  };

  return {
    scanResult,
    isScanning,
    error,
    scanQRCode,
    clearScanResult,
  };
}

// Real-time file upload with error handling
export function useFileUploadRealtime() {
  const generateUploadUrl = useMutation(api.documentRequirements.generateUploadUrl);
  const uploadDocument = useMutation(api.documentRequirements.uploadDocument);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    formId: Id<"forms">,
    fieldName: string
  ) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size exceeds 10MB limit");
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please upload JPG, PNG, or PDF files.");
      }

      // Get upload URL
      const uploadUrl = await generateUploadUrl({});
      setUploadProgress(25);

      // Upload file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const { storageId } = await response.json();
      setUploadProgress(75);

      // Record document upload
      const result = await uploadDocument({
        formId,
        fieldName,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
