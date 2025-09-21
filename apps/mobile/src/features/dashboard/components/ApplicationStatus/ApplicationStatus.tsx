import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationStatusProps } from '../../types';
import { getJobCategoryColor, getJobCategoryIcon, getCardTypeLabel } from '@/src/utils/job-category-utils';
import { styles } from './ApplicationStatus.styles';

interface ApplicationProgress {
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStep: string | null;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ currentApplication }) => {
  if (!currentApplication) return null;

  const getApplicationProgress = (): ApplicationProgress => {
    const steps = ['Submitted', 'Under Review', 'Approved'];
    const currentStep = steps.indexOf(currentApplication.status);
    
    return {
      currentStep: currentStep + 1,
      totalSteps: steps.length,
      status: currentApplication.status,
      nextStep: currentStep < steps.length - 1 ? steps[currentStep + 1] : null
    };
  };

  const progress = getApplicationProgress();
  const categoryColor = getJobCategoryColor(currentApplication.jobCategory?.name || '');
  const categoryIcon = getJobCategoryIcon(currentApplication.jobCategory?.name || '') as any;
  const cardLabel = getCardTypeLabel(currentApplication.jobCategory?.name);

  const getStatusColor = () => {
    if (progress.status === 'Approved') return styles.statusApproved.color;
    if (progress.status === 'Under Review') return styles.statusReview.color;
    return styles.statusSubmitted.color;
  };

  const getStatusBackgroundColor = () => {
    if (progress.status === 'Approved') return styles.statusApprovedBg.backgroundColor;
    if (progress.status === 'Under Review') return styles.statusReviewBg.backgroundColor;
    return styles.statusSubmittedBg.backgroundColor;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons 
            name={categoryIcon} 
            size={16} 
            color={styles.categoryIcon.color} 
          />
          <Text style={styles.categoryText}>{cardLabel}</Text>
        </View>
        <Text style={styles.applicationId}>
          #{currentApplication._id.slice(-6).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Application Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor() }]}>
            <Text style={[styles.progressStatus, { color: getStatusColor() }]}>
              {progress.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(progress.currentStep / progress.totalSteps) * 100}%`,
                backgroundColor: categoryColor
              }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          Step {progress.currentStep} of {progress.totalSteps}
          {progress.nextStep && ` • Next: ${progress.nextStep}`}
        </Text>
      </View>
    </View>
  );
};
