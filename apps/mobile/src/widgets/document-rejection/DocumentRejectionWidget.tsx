import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './DocumentRejectionWidget.styles';
import { EnrichedRejection } from '@entities/document/model/rejection-types';
import { getRejectionCategoryLabel } from '@entities/document/model/rejection-constants';
// Phase 4 Migration: Support new referral types
import { IssueType } from '@entities/document/model/referral-types';
import type { EnrichedReferral } from '@entities/document/model/referral-types';

interface DocumentRejectionWidgetProps {
  rejection: EnrichedRejection | EnrichedReferral; // Support both old and new types
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
  
  // Phase 4 Migration: Check if this is a new referral type
  const isReferralType = 'issueType' in rejection;
  const isMedicalReferral = isReferralType && (rejection as EnrichedReferral).issueType === IssueType.MEDICAL_REFERRAL;
  
  // Dynamic colors based on type
  const primaryColor = isMedicalReferral ? '#3B82F6' : isReferralType ? '#F59E0B' : '#EF4444';
  const iconName = isMedicalReferral ? 'medkit' : isReferralType ? 'document-text' : 'close-circle';
  const headerTitle = isMedicalReferral ? 'Medical Referral' : isReferralType ? 'Document Needs Revision' : 'Document Rejected';
  
  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
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
      {/* Header - Phase 4 Migration: Dynamic based on type */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons 
            name={iconName as any}
            size={moderateScale(40)} 
            color={primaryColor}
          />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: primaryColor }]}>{headerTitle}</Text>
          <Text style={styles.documentName}>{documentName}</Text>
        </View>
        
        <View style={styles.attemptBadge}>
          <Text style={styles.attemptText}>
            Attempt #{rejection.attemptNumber}
          </Text>
        </View>
      </View>

      {/* Reason - Phase 4 Migration: Dynamic label */}
      <View style={styles.reasonSection}>
        <Text style={styles.reasonLabel}>
          {isMedicalReferral ? 'Medical Finding' : isReferralType ? 'Issue Description' : 'Rejection Reason'}
        </Text>
        <Text style={styles.reasonText}>
          {isReferralType ? (rejection as EnrichedReferral).reason : (rejection as EnrichedRejection).rejectionReason}
        </Text>
        
        {/* Category Badge - Phase 4 Migration: Show category for all types */}
        <View style={styles.categoryBadge}>
          <Ionicons 
            name="pricetag" 
            size={moderateScale(14)} 
            color={primaryColor}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryText}>
            {isReferralType 
              ? String((rejection as EnrichedReferral).category).replace(/_/g, ' ')
              : getRejectionCategoryLabel((rejection as EnrichedRejection).rejectionCategory)
            }
          </Text>
        </View>
      </View>

      {/* Doctor Info - Phase 4 Migration: Show for medical referrals */}
      {isMedicalReferral && (rejection as EnrichedReferral).doctorName && (
        <View style={styles.doctorSection}>
          <View style={styles.doctorHeader}>
            <Ionicons name="person-circle-outline" size={moderateScale(20)} color="#3B82F6" />
            <Text style={styles.doctorTitle}>Consulting Doctor</Text>
          </View>
          <Text style={styles.doctorName}>{(rejection as EnrichedReferral).doctorName}</Text>
          {(rejection as EnrichedReferral).clinicAddress && (
            <View style={styles.clinicInfo}>
              <Ionicons name="location-outline" size={moderateScale(14)} color="#6B7280" />
              <Text style={styles.clinicAddress}>{(rejection as EnrichedReferral).clinicAddress}</Text>
            </View>
          )}
        </View>
      )}

      {/* Specific Issues - Different labels for medical vs document */}
      {rejection.specificIssues && rejection.specificIssues.length > 0 && (
        <View style={styles.issuesSection}>
          <Text style={styles.issuesTitle}>
            {isMedicalReferral ? 'Consultation Details:' : 'Issues to Address:'}
          </Text>
          <View style={styles.issuesList}>
            {rejection.specificIssues.map((issue: string, index: number) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons 
                  name={isMedicalReferral ? 'information-circle' : 'alert-circle'} 
                  size={moderateScale(16)} 
                  color={isMedicalReferral ? '#3B82F6' : '#F59E0B'}
                  style={styles.issueIcon}
                />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Date - Phase 4 Migration: Dynamic text */}
      <View style={styles.dateSection}>
        <Ionicons 
          name="calendar-outline" 
          size={moderateScale(14)} 
          color="#9CA3AF"
          style={styles.dateIcon}
        />
        <Text style={styles.dateText}>
          {isMedicalReferral ? 'Referred on' : isReferralType ? 'Flagged on' : 'Rejected on'} {formatDate(
            isReferralType ? (rejection as EnrichedReferral).referredAt : (rejection as EnrichedRejection).rejectedAt
          )}
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

      {/* Action Buttons - Medical referrals don't show Resubmit */}
      {showActions && !rejection.wasReplaced && !isMedicalReferral && (
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
    </View>
  );
}
