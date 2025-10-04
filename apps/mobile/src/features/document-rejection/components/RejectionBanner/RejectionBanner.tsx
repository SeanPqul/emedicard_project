import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RejectionBannerProps } from './RejectionBanner.types';
import { styles } from './RejectionBanner.styles';
import { moderateScale } from '@shared/utils/responsive';
import { 
  getRejectionSeverity, 
  RejectionCategoryLabels,
  RejectionCategoryIcons 
} from '@entities/document';

export const RejectionBanner: React.FC<RejectionBannerProps> = ({
  rejection,
  onViewDetails,
  onResubmit,
  showActions = true,
}) => {
  const severity = getRejectionSeverity(rejection.rejectionCategory);
  
  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          container: styles.containerHigh,
          iconColor: '#DC2626',
          iconName: 'close-circle' as const,
          categoryBadge: styles.categoryBadgeHigh,
          categoryText: styles.categoryTextHigh,
        };
      case 'medium':
        return {
          container: styles.containerMedium,
          iconColor: '#EA580C',
          iconName: 'alert-circle' as const,
          categoryBadge: styles.categoryBadgeMedium,
          categoryText: styles.categoryTextMedium,
        };
      case 'low':
        return {
          container: styles.containerLow,
          iconColor: '#D97706',
          iconName: 'information-circle' as const,
          categoryBadge: styles.categoryBadgeLow,
          categoryText: styles.categoryTextLow,
        };
    }
  };

  const severityStyles = getSeverityStyles();
  const categoryLabel = RejectionCategoryLabels[rejection.rejectionCategory];
  const categoryIcon = RejectionCategoryIcons[rejection.rejectionCategory];

  return (
    <View style={[styles.container, severityStyles.container]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={severityStyles.iconName}
            size={moderateScale(24)}
            color={severityStyles.iconColor}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Document Rejected</Text>
          <Text style={styles.attemptBadge}>
            Attempt #{rejection.attemptNumber}
          </Text>
        </View>
      </View>

      <View style={styles.reasonSection}>
        <Text style={styles.reasonTitle}>Reason:</Text>
        <Text style={styles.reasonText}>{rejection.rejectionReason}</Text>
      </View>

      <View style={[styles.categoryBadge, severityStyles.categoryBadge]}>
        <Ionicons
          name={categoryIcon as any}
          size={moderateScale(16)}
          color={severityStyles.iconColor}
        />
        <Text style={[styles.categoryText, severityStyles.categoryText]}>
          {categoryLabel}
        </Text>
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={onResubmit}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={moderateScale(20)}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Resubmit Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onViewDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
