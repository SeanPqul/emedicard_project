// This file re-exports components from their new feature-slice locations
// Form Components
import { CustomButton } from "../shared/ui/Button";
import { CTAButton } from "../shared/ui/CTAButton";
import { CustomTextInput } from "../shared/ui/CustomTextInput";
import { PasswordStrengthIndicator } from "../features/auth/ui/PasswordStrengthIndicator";

// UI Components
import { Divider } from "../shared/ui/Divider";
import { ErrorText } from "../shared/ui/ErrorText";
import { LinkText } from "../shared/ui/LinkText";
import { OtpInputUI } from "../features/auth/ui/OtpInputUI";
import { SignOutButton } from "../features/auth/ui/SignOutButton";
import VerificationPage from "../features/auth/ui/VerificationPage";
import { DashboardHeader } from "../features/dashboard/ui/header";

// Dashboard Components
import { StatCard } from "../features/dashboard/ui/StatCard";
import { ActionButton } from "../shared/ui/ActionButton";
import { ActivityItem } from "../features/dashboard/ui/ActivityItem";
import { ProfileLink } from "../features/profile/ui/ProfileLink";
import { EmptyState } from "../shared/ui/EmptyState";

// Error & Feedback Components
import { ErrorBoundary } from "../shared/ui/ErrorBoundary";
import { Toast } from "../shared/ui/Toast";
import type { ToastType, ToastProps } from "../shared/ui/Toast";
import { LoadingSpinner } from "../shared/ui/LoadingSpinner";
import { ErrorState, NetworkErrorState, ServerErrorState, UploadErrorState, PaymentErrorState } from "../shared/ui/ErrorState";
import type { ErrorType } from "../shared/ui/ErrorState";

// Responsive Components
import { ResponsiveLayout, ResponsiveRow, ResponsiveColumn, ResponsiveGrid } from "../shared/ui/ResponsiveLayout";

// Enhanced UI Components
import { DragDropUpload } from "../shared/ui/DragDropUpload";
import { QRCodeScanner } from "../shared/ui/QRScanner";
import { FeedbackSystem, useFeedback } from "../shared/ui/FeedbackSystem";

/**
 * @deprecated This is a legacy export file. Import directly from the component's new location.
 * This file will be removed in future updates.
 */
export {
    // Form Components
    CustomButton,
    CTAButton,
    CustomTextInput,
    PasswordStrengthIndicator,
    
    // UI Components
    Divider,
    ErrorText,
    LinkText,
    OtpInputUI,
    SignOutButton,
    VerificationPage,
    DashboardHeader,
    
    // Dashboard Components
    StatCard,
    ActionButton,
    ActivityItem,
    ProfileLink,
    EmptyState,
    
    // Error & Feedback Components
    ErrorBoundary,
    Toast,
    LoadingSpinner,
    ErrorState,
    NetworkErrorState,
    ServerErrorState,
    UploadErrorState,
    PaymentErrorState,
    
    // Responsive Components
    ResponsiveLayout,
    ResponsiveRow,
    ResponsiveColumn,
    ResponsiveGrid,
    
    // Enhanced UI Components
    DragDropUpload,
    QRCodeScanner,
    FeedbackSystem,
    useFeedback
};

// Export types
export type { ToastType, ToastProps, ErrorType };

/**
 * Migration Status: Complete
 * All components have been migrated to the feature-slice architecture.
 * This file provides backward compatibility but should be considered deprecated.
 */

