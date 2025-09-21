import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography, getShadow } from '../../styles/theme';
import { getJobCategoryColor, getJobCategoryIcon, getCardTypeLabel } from '../../utils/job-category-utils';

interface ApplicationProgress {
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStep: string | null;
}

interface ApplicationStatusProps {
  currentApplication: any;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ currentApplication }) => {
  if (!currentApplication) return null;

  const getApplicationProgress = (): ApplicationProgress | null => {
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
  if (!progress) return null;

  const categoryColor = getJobCategoryColor(currentApplication.jobCategory?.name || '');
  const categoryIcon = getJobCategoryIcon(currentApplication.jobCategory?.name || '');
  const cardLabel = getCardTypeLabel(currentApplication.jobCategory?.name);

  const getStatusColor = () => {
    if (progress.status === 'Approved') return getColor('accent.safetyGreen');
    if (progress.status === 'Under Review') return getColor('accent.warningOrange');
    return getColor('accent.medicalBlue');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Ionicons 
            name={categoryIcon as any} 
            size={16} 
            color={getColor('text.inverse')} 
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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
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

const styles = StyleSheet.create({
  container: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('medium'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
  },
  categoryText: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  applicationId: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  progressContainer: {
    marginTop: getSpacing('sm'),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs') / 2,
    borderRadius: getBorderRadius('md'),
  },
  progressStatus: {
    ...getTypography('caption'),
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('full'),
    marginBottom: getSpacing('xs'),
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius('full'),
  },
  progressText: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
});
