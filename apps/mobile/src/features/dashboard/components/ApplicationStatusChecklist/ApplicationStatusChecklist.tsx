import React from 'react';
import { View, Text } from 'react-native';
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
  const getSteps = (): ChecklistStep[] => {
    const status = currentStatus || '';
    
    // Define step labels based on status (present tense for in-progress, past tense for completed)
    const getStepLabel = (stepId: string, status: 'completed' | 'current' | 'upcoming') => {
      if (status === 'completed') {
        // Past tense for completed steps
        switch (stepId) {
          case 'payment': return { label: 'Payment confirmed', subtitle: 'Transaction successful' };
          case 'orientation': return { label: 'Orientation attended', subtitle: 'Check-in & check-out completed' };
          case 'documentVerification': return { label: 'Documents verified', subtitle: 'All documents approved' };
          case 'review': return { label: 'Application approved', subtitle: 'Ready for health card issuance' };
          case 'cardReady': return { label: 'Health card issued', subtitle: 'Card is ready for use' };
          default: return { label: 'Completed' };
        }
      } else if (status === 'current') {
        // Present/imperative tense for current steps
        switch (stepId) {
          case 'payment': return { label: 'Awaiting payment', subtitle: 'Complete your payment' };
          case 'orientation': return { label: 'Orientation pending', subtitle: 'Attend scheduled session' };
          case 'documentVerification': return { label: 'Verifying documents', subtitle: 'Admin review in progress' };
          case 'review': return { label: 'Under review', subtitle: 'Application being evaluated' };
          case 'cardReady': return { label: 'Processing card', subtitle: 'Health card being prepared' };
          default: return { label: 'In Progress' };
        }
      } else {
        // Future tense for upcoming steps
        switch (stepId) {
          case 'payment': return { label: 'Payment required' };
          case 'orientation': return { label: 'Orientation required' };
          case 'documentVerification': return { label: 'Document verification' };
          case 'review': return { label: 'Application review' };
          case 'cardReady': return { label: 'Health card issuance' };
          default: return { label: 'Upcoming' };
        }
      }
    };

    // Build steps based on requirements
    const steps: ChecklistStep[] = [];

    // Payment step
    if (status === 'Pending Payment') {
      const stepData = getStepLabel('payment', 'current');
      steps.push({ id: 'payment', ...stepData, status: 'current' });
    } else {
      const stepData = getStepLabel('payment', 'completed');
      steps.push({ id: 'payment', ...stepData, status: 'completed' });
    }

    // Orientation step (only for food handlers)
    if (requiresOrientation) {
      if (status === 'Pending Payment') {
        const stepData = getStepLabel('orientation', 'upcoming');
        steps.push({ id: 'orientation', ...stepData, status: 'upcoming' });
      } else if (status === 'For Payment Validation') {
        const stepData = getStepLabel('orientation', 'upcoming');
        steps.push({ id: 'orientation', ...stepData, status: 'upcoming' });
      } else if (orientationCompleted) {
        // Only mark as completed if orientation was actually completed (check-in/check-out done)
        const stepData = getStepLabel('orientation', 'completed');
        steps.push({ id: 'orientation', ...stepData, status: 'completed' });
      } else if (status === 'Under Review' || status === 'Submitted' || status === 'Approved') {
        // These statuses should have orientation completed, but show completed anyway
        const stepData = getStepLabel('orientation', 'completed');
        steps.push({ id: 'orientation', ...stepData, status: 'completed' });
      } else {
        // Default to current if status is unclear or 'For Orientation'
        const stepData = getStepLabel('orientation', 'current');
        steps.push({ id: 'orientation', ...stepData, status: 'current' });
      }
    }

    // Document verification step
    if (status === 'Pending Payment') {
      const stepData = getStepLabel('documentVerification', 'upcoming');
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (status === 'For Payment Validation') {
      const stepData = getStepLabel('documentVerification', 'upcoming');
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (requiresOrientation && status === 'For Orientation') {
      const stepData = getStepLabel('documentVerification', 'upcoming');
      steps.push({ id: 'documentVerification', ...stepData, status: 'upcoming' });
    } else if (status === 'For Document Verification' || status === 'Documents Need Revision') {
      const stepData = getStepLabel('documentVerification', 'current');
      steps.push({ id: 'documentVerification', ...stepData, status: 'current' });
    } else if (documentsVerified) {
      // Only mark as completed if documents are actually verified
      const stepData = getStepLabel('documentVerification', 'completed');
      steps.push({ id: 'documentVerification', ...stepData, status: 'completed' });
    } else if (status === 'Approved') {
      // Approved status always means documents were verified
      const stepData = getStepLabel('documentVerification', 'completed');
      steps.push({ id: 'documentVerification', ...stepData, status: 'completed' });
    } else {
      // Default to current for statuses like Submitted/Under Review when documents aren't verified yet
      const stepData = getStepLabel('documentVerification', 'current');
      steps.push({ id: 'documentVerification', ...stepData, status: 'current' });
    }

    // Review step
    if (status === 'Approved') {
      const stepData = getStepLabel('review', 'completed');
      steps.push({ id: 'review', ...stepData, status: 'completed' });
    } else if (status === 'Under Review' || status === 'Submitted') {
      const stepData = getStepLabel('review', 'current');
      steps.push({ id: 'review', ...stepData, status: 'current' });
    } else {
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

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
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
            {step.status === 'current' && (
              <View style={[styles.currentBadge, { backgroundColor: categoryColor }]}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          {index < steps.length - 1 && (
            <View style={[styles.connector, step.status === 'completed' && styles.connectorCompleted]} />
          )}
        </View>
      ))}
    </View>
  );
};
