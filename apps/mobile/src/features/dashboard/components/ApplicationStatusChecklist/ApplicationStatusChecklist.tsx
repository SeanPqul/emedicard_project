import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './ApplicationStatusChecklist.styles';

interface ChecklistStep {
  id: string;
  label: string;
  subtitle?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ApplicationStatusChecklistProps {
  currentStatus: string;
  requiresOrientation: boolean;
  categoryColor: string;
  orientationCompleted?: boolean;
  documentsVerified?: boolean; // NEW: Track if documents are actually verified
}

export const ApplicationStatusChecklist: React.FC<ApplicationStatusChecklistProps> = ({
  currentStatus,
  requiresOrientation,
  categoryColor,
  orientationCompleted = false,
  documentsVerified = false,
}) => {
  const [showAll, setShowAll] = React.useState(false);
  const getSteps = (): ChecklistStep[] => {
    const status = currentStatus || '';
    
    // If application is rejected, show only rejection status
    if (status === 'Rejected' || status === 'Cancelled') {
      return [{
        id: 'rejected',
        label: status === 'Rejected' ? 'Application rejected' : 'Application cancelled',
        subtitle: 'This application has been closed',
        status: 'current' as const
      }];
    }
    
    // Define step labels based on status (present tense for in-progress, past tense for completed)
    const getStepLabel = (stepId: string, status: 'completed' | 'current' | 'upcoming') => {
      if (status === 'completed') {
        // Past tense for completed steps
        switch (stepId) {
          case 'payment': return { label: 'Payment confirmed', subtitle: 'Transaction successful' };
          case 'orientation': return { label: 'Orientation attended', subtitle: 'Check-in & check-out completed' };
          case 'documentVerification': return { label: 'Documents verified', subtitle: 'All documents approved' };
          case 'review': return { label: 'Application review completed', subtitle: 'Ready for health card issuance' };
          case 'cardReady': return { label: 'Health card issued', subtitle: 'Card is ready for use' };
          default: return { label: 'Completed' };
        }
      } else if (status === 'current') {
        // Present/imperative tense for current steps
        switch (stepId) {
          case 'payment': return { label: 'Awaiting payment', subtitle: 'Complete your payment' };
          case 'orientation': return { label: 'Orientation pending', subtitle: 'Attend scheduled session' };
          case 'documentVerification': return { label: 'Verifying documents', subtitle: 'Admin review in progress' };
          case 'review': return { label: 'Application under review', subtitle: 'Application review in progress' };
          case 'cardReady': return { label: 'Processing card', subtitle: 'Health card being prepared' };
          default: return { label: 'In Progress' };
        }
      } else {
        // Future tense for upcoming steps
        switch (stepId) {
          case 'payment': return { label: 'Payment required' };
          case 'orientation': return { label: 'Orientation required' };
          case 'documentVerification': return { label: 'Document verification' };
          case 'review': return { label: 'Application review pending' };
          case 'cardReady': return { label: 'Health card issuance' };
          default: return { label: 'Upcoming' };
        }
      }
    };

    // Build steps based on requirements
    const steps: ChecklistStep[] = [];

    // Payment step
    if (status === 'Pending Payment' || status === 'Submitted') {
      // Submitted status means payment failed/expired/cancelled, need to repay
      const stepData = getStepLabel('payment', 'current');
      steps.push({ id: 'payment', ...stepData, status: 'current' });
    } else if (status === 'For Payment Validation' || status === 'Payment Rejected') {
      // Manual payments waiting for admin validation - still current
      const stepData = { label: 'Awaiting payment validation', subtitle: 'Admin reviewing your payment' };
      steps.push({ id: 'payment', ...stepData, status: 'current' });
    } else if (status === 'Under Administrative Review' || status === 'Locked - Max Attempts') {
      // Application locked due to max payment attempts - show as blocked
      // Note: 'Locked - Max Attempts' is old status, kept for backward compatibility
      const stepData = { label: 'Payment under review', subtitle: 'Admin review required' };
      steps.push({ id: 'payment', ...stepData, status: 'current' });
    } else if (status === 'Scheduled' || status === 'For Orientation' || status === 'For Document Verification' || status === 'Documents Need Revision' || status === 'Under Review' || status === 'Approved') {
      // Payment has been validated and approved - only these statuses mean payment is complete
      const stepData = getStepLabel('payment', 'completed');
      steps.push({ id: 'payment', ...stepData, status: 'completed' });
    } else {
      // Unknown status - default to current to be safe
      const stepData = getStepLabel('payment', 'current');
      steps.push({ id: 'payment', ...stepData, status: 'current' });
    }

    // Orientation step (only for food handlers)
    if (requiresOrientation) {
      if (status === 'Pending Payment' || status === 'Submitted') {
        // Payment not completed yet - orientation is still upcoming
        const stepData = getStepLabel('orientation', 'upcoming');
        steps.push({ id: 'orientation', ...stepData, status: 'upcoming' });
      } else if (status === 'For Payment Validation' || status === 'Under Administrative Review' || status === 'Locked - Max Attempts') {
        // Payment not validated yet or locked - orientation is still upcoming
        // Note: 'Locked - Max Attempts' is old status, kept for backward compatibility
        const stepData = getStepLabel('orientation', 'upcoming');
        steps.push({ id: 'orientation', ...stepData, status: 'upcoming' });
      } else if (orientationCompleted) {
        // Only mark as completed if orientation was actually completed (check-in/check-out done)
        const stepData = getStepLabel('orientation', 'completed');
        steps.push({ id: 'orientation', ...stepData, status: 'completed' });
      } else if (status === 'For Document Verification' || status === 'Documents Need Revision') {
        // Orientation should be completed before document verification
        const stepData = getStepLabel('orientation', 'completed');
        steps.push({ id: 'orientation', ...stepData, status: 'completed' });
      } else if (status === 'Under Review' || status === 'Approved') {
        // These statuses should have orientation completed
        const stepData = getStepLabel('orientation', 'completed');
        steps.push({ id: 'orientation', ...stepData, status: 'completed' });
      } else if (status === 'Scheduled') {
        // Orientation is scheduled but not yet attended
        const stepData = { label: 'Orientation pending', subtitle: 'Attend scheduled session' };
        steps.push({ id: 'orientation', ...stepData, status: 'current' });
      } else {
        // Default to current if status is unclear or 'For Orientation'
        const stepData = getStepLabel('orientation', 'current');
        steps.push({ id: 'orientation', ...stepData, status: 'current' });
      }
    }

    // Document verification step
    // IMPORTANT: Check documentsVerified flag FIRST before checking status
    // This ensures that once all documents are approved, it shows as completed regardless of status
    if (status === 'Pending Payment' || status === 'Submitted') {
      // Payment not completed yet - document verification is still upcoming
      const stepData = getStepLabel('documentVerification', 'upcoming');
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (status === 'For Payment Validation') {
      const stepData = getStepLabel('documentVerification', 'upcoming');
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (status === 'Under Administrative Review' || status === 'Locked - Max Attempts') {
      // Application locked - document verification blocked until payment is resolved
      // Note: 'Locked - Max Attempts' is old status, kept for backward compatibility
      const stepData = { label: 'Document verification pending', subtitle: 'Awaiting payment resolution' };
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (documentsVerified || status === 'Approved') {
      // Mark as completed if:
      // 1. All documents are actually verified (documentsVerified === true), OR
      // 2. Application is approved (always means docs were verified)
      const stepData = getStepLabel('documentVerification', 'completed');
      steps.push({ id: 'documentVerification', ...stepData, status: 'completed' });
    } else if (status === 'For Document Verification' || status === 'Documents Need Revision') {
      // Documents still under review or need revision
      const stepData = getStepLabel('documentVerification', 'current');
      steps.push({ id: 'documentVerification', ...stepData, status: 'current' });
    } else if (requiresOrientation && (status === 'For Orientation' || status === 'Scheduled')) {
      // Parallel processing: documents being verified while user waits for orientation
      // Since documentsVerified check already passed above, this means docs are still being reviewed
      const stepData = getStepLabel('documentVerification', 'current');
      steps.push({ id: 'documentVerification', ...stepData, status: 'current' });
    } else {
      // Default to current for other statuses when documents aren't verified yet
      const stepData = getStepLabel('documentVerification', 'current');
      steps.push({ id: 'documentVerification', ...stepData, status: 'current' });
    }

    // Review step
    if (status === 'Approved') {
      const stepData = getStepLabel('review', 'completed');
      steps.push({ id: 'review', ...stepData, status: 'completed' });
    } else if (status === 'Under Review') {
      // Only show as current when actually under review (after payment/orientation/docs complete)
      const stepData = getStepLabel('review', 'current');
      steps.push({ id: 'review', ...stepData, status: 'current' });
    } else {
      // For Submitted (payment failed), Pending Payment, Scheduled, etc. - show as upcoming
      const stepData = getStepLabel('review', 'upcoming');
      steps.push({ id: 'review', ...stepData, status: 'upcoming' });
    }

    // Card ready step
    if (status === 'Approved') {
      const stepData = getStepLabel('cardReady', 'completed');
      steps.push({ id: 'cardReady', ...stepData, status: 'completed' });
    } else {
      const stepData = getStepLabel('cardReady', 'upcoming');
      steps.push({ id: 'cardReady', ...stepData, status: 'upcoming' });
    }

    return steps;
  };

  const steps = getSteps();

  const getStepIcon = (status: 'completed' | 'current' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'ellipse';
      case 'upcoming':
        return 'ellipse-outline';
    }
  };

  const getStepColor = (status: 'completed' | 'current' | 'upcoming') => {
    // Special handling for rejected status
    if (currentStatus === 'Rejected' || currentStatus === 'Cancelled') {
      return theme.colors.semantic.error;
    }
    
    switch (status) {
      case 'completed':
        return theme.colors.semantic.success;
      case 'current':
        return categoryColor;
      case 'upcoming':
        return theme.colors.gray[300];
    }
  };

  const getStepTextStyle = (status: 'completed' | 'current' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return styles.stepTextCompleted;
      case 'current':
        return styles.stepTextCurrent;
      case 'upcoming':
        return styles.stepTextUpcoming;
    }
  };

  // Find current step index
  const currentIndex = steps.findIndex(s => s.status === 'current');
  
  // Show completed steps + current + next 1 step by default
  const visibleSteps = showAll 
    ? steps 
    : steps.filter((step, index) => {
        // Always show completed steps
        if (step.status === 'completed') return true;
        // Always show current step
        if (step.status === 'current') return true;
        // Show next 1 upcoming step after current
        if (step.status === 'upcoming' && currentIndex >= 0) {
          return index <= currentIndex + 2;
        }
        return false;
      });
  
  const hiddenCount = steps.length - visibleSteps.length;

  return (
    <View style={styles.container}>
      {visibleSteps.map((step, index) => {
        const isLastVisible = index === visibleSteps.length - 1;
        const originalIndex = steps.indexOf(step);
        const hasMoreSteps = originalIndex < steps.length - 1;
        
        return (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getStepIcon(step.status)}
                  size={moderateScale(20)}
                  color={getStepColor(step.status)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepText, getStepTextStyle(step.status)]}>
                  {step.label}
                </Text>
                {step.subtitle && step.status !== 'upcoming' && (
                  <Text style={styles.stepSubtitle}>
                    {step.subtitle}
                  </Text>
                )}
              </View>
              {step.status === 'current' && currentStatus !== 'Rejected' && currentStatus !== 'Cancelled' && (
                <View style={[styles.currentBadge, { backgroundColor: categoryColor }]}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
            {hasMoreSteps && !isLastVisible && (
              <View style={[styles.connector, step.status === 'completed' && styles.connectorCompleted]} />
            )}
          </View>
        );
      })}
      
      {/* Show more/less toggle */}
      {hiddenCount > 0 && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowAll(!showAll)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            {showAll ? 'Show less' : `View ${hiddenCount} more step${hiddenCount !== 1 ? 's' : ''}`}
          </Text>
          <Ionicons
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(16)}
            color={theme.colors.primary[600]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
