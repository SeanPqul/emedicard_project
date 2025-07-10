// Form Components
import { CustomButton } from "./CustomButton";
import { CustomTextInput } from "./CustomTextInput";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

// UI Components
import { Divider } from "./Divider";
import { ErrorText } from "./ErrorText";
import { LinkText } from "./LinkText";
import { OtpInputUI } from "./OtpInputUI";
import { SignOutButton } from "./SignOutButton";
import VerificationPage from "./VerificationPage";

// Dashboard Components
import { StatCard } from "./StatCard";
import { ActionButton } from "./ActionButton";
import { ActivityItem } from "./ActivityItem";
import { ProfileLink } from "./ProfileLink";
import { EmptyState } from "./EmptyState";

// Accessibility Components
import { AccessibleView } from "./accessibility/AccessibleView";

// Error & Feedback Components
import { ErrorBoundary } from "./error/ErrorBoundary";
import { Toast } from "./feedback/Toast";
import type { ToastType, ToastProps } from "./feedback/Toast";

// Animated Components
import { AnimatedCard } from "./animated/AnimatedCard";
import { SkeletonLoader, SkeletonGroup } from "./animated/SkeletonLoader";
import { PageTransition, StaggerChildren } from "./animated/PageTransition";

export {
    // Form Components
    CustomButton,
    CustomTextInput,
    PasswordStrengthIndicator,
    
    // UI Components
    Divider,
    ErrorText,
    LinkText,
    OtpInputUI,
    SignOutButton,
    VerificationPage,
    
    // Dashboard Components
    StatCard,
    ActionButton,
    ActivityItem,
    ProfileLink,
    EmptyState,
    
    // Accessibility Components
    AccessibleView,
    
    // Error & Feedback Components
    ErrorBoundary,
    Toast,
    
    // Animated Components
    AnimatedCard,
    SkeletonLoader,
    SkeletonGroup,
    PageTransition,
    StaggerChildren
};

// Export types
export type { ToastType, ToastProps };

