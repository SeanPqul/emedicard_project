import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './DocumentRejectionWidget.styles';
import { EnrichedRejection } from '@entities/document/model/rejection-types';
import { getRejectionCategoryLabel } from '@entities/document/model/rejection-constants';

interface DocumentRejectionWidgetProps {
  rejection: EnrichedRejection;
  documentName: string;
  onResubmit: () => void;
  onViewDetails: () => void;
  containerStyle?: any;
  showActions?: boolean;
  isLoading?: boolean;
}

export function DocumentRejectionWidget({
  rejection,
  documentName,
  onResubmit,
  onViewDetails,
  containerStyle,
  showActions = true,
  isLoading = false,
}: DocumentRejectionWidgetProps) {
  
  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      </View>
    );
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons 
            name="close-circle" 
            size={moderateScale(40)} 
            color="#EF4444" 
          />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Document Rejected</Text>
          <Text style={styles.documentName}>{documentName}</Text>
        </View>
        
        <View style={styles.attemptBadge}>
          <Text style={styles.attemptText}>
            Attempt #{rejection.attemptNumber}
          </Text>
        </View>
      </View>

      {/* Rejection Reason */}
      <View style={styles.reasonSection}>
        <Text style={styles.reasonLabel}>Rejection Reason</Text>
        <Text style={styles.reasonText}>{rejection.rejectionReason}</Text>
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Ionicons 
            name="pricetag" 
            size={moderateScale(14)} 
            color="#F59E0B"
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryText}>
            {getRejectionCategoryLabel(rejection.rejectionCategory)}
          </Text>
        </View>
      </View>

      {/* Specific Issues */}
      {rejection.specificIssues && rejection.specificIssues.length > 0 && (
        <View style={styles.issuesSection}>
          <Text style={styles.issuesTitle}>Issues to Address:</Text>
          <View style={styles.issuesList}>
            {rejection.specificIssues.map((issue: string, index: number) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons 
                  name="alert-circle" 
                  size={moderateScale(16)} 
                  color="#F59E0B"
                  style={styles.issueIcon}
                />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Rejection Date */}
      <View style={styles.dateSection}>
        <Ionicons 
          name="calendar-outline" 
          size={moderateScale(14)} 
          color="#9CA3AF"
          style={styles.dateIcon}
        />
        <Text style={styles.dateText}>
          Rejected on {formatDate(rejection.rejectedAt)}
        </Text>
      </View>

      {/* Replacement Status - Show above actions if document was replaced */}
      {rejection.wasReplaced && rejection.replacedAt && (
        <View style={styles.replacementStatus}>
          <View style={styles.replacementStatusHeader}>
            <Ionicons 
              name="checkmark-circle" 
              size={moderateScale(20)} 
              color="#10B981"
            />
            <Text style={styles.replacementStatusTitle}>Document Resubmitted</Text>
          </View>
          <Text style={styles.replacementStatusText}>
            New document submitted on {formatDate(rejection.replacedAt)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionSection}>
          {!rejection.wasReplaced && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={onResubmit}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="cloud-upload-outline" 
                size={moderateScale(18)} 
                color="white"
              />
              <Text style={styles.primaryButtonText}>Resubmit</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onViewDetails}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="information-circle-outline" 
              size={moderateScale(18)} 
              color="#1F2937"
            />
            <Text style={styles.secondaryButtonText}>More Info</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
