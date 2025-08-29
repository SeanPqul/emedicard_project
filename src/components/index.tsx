// Form Components
import { CustomButton } from "./ui/Button";
import { CTAButton } from "./CTAButton";
import { CustomTextInput } from "./CustomTextInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

// UI Components
import { Divider } from "./Divider";
import { ErrorText } from "./ErrorText";
import { LinkText } from "./LinkText";
import { OtpInputUI } from "./OtpInputUI";
import { SignOutButton } from "./SignOutButton";
import VerificationPage from "./VerificationPage";
import { DashboardHeader } from "./ui/DashboardHeader";

// Dashboard Components
import { StatCard } from "./StatCard";
import { ActionButton } from "./ActionButton";
import { ActivityItem } from "./ActivityItem";
import { ProfileLink } from "./ProfileLink";
import { EmptyState } from "./EmptyState";

// Error & Feedback Components
import { ErrorBoundary } from "./ErrorBoundary";
import { Toast } from "./Toast";
import type { ToastType, ToastProps } from "./Toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorState, NetworkErrorState, ServerErrorState, UploadErrorState, PaymentErrorState } from "./ErrorState";
import type { ErrorType } from "./ErrorState";

// Responsive Components
import { ResponsiveLayout, ResponsiveRow, ResponsiveColumn, ResponsiveGrid } from "./ResponsiveLayout";

// Enhanced UI Components
import { DragDropUpload } from "./DragDropUpload";
import { QRCodeScanner } from "./QRCodeScanner";
import { FeedbackSystem, useFeedback } from "./FeedbackSystem";

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

