import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './DocumentReferralWidget.styles';
import {
  EnrichedReferral,
  IssueType,
  getCategoryLabel,
} from '@entities/document/model/referral-types';

interface DocumentReferralWidgetProps {
  referral: EnrichedReferral;
  documentName: string;
  onAction: () => void; // Action button (resubmit or view consultation info)
  onViewDetails: () => void;
  containerStyle?: any;
  showActions?: boolean;
  isLoading?: boolean;
}

export function DocumentReferralWidget({
  referral,
  documentName,
  onAction,
  onViewDetails,
  containerStyle,
  showActions = true,
  isLoading = false,
}: DocumentReferralWidgetProps) {

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

  const isMedical = referral.issueType === IssueType.MEDICAL_REFERRAL;
  const isDocumentIssue = referral.issueType === IssueType.DOCUMENT_ISSUE;

  // Different colors and icons based on type
  const iconName = isMedical ? "medical" : "alert-circle";
  const iconColor = isMedical ? "#3B82F6" : "#F59E0B"; // Blue for medical, Orange for issues
  const headerTitle = isMedical ? "Medical Finding Detected" : "Document Needs Correction";
  const headerColor = isMedical ? "#3B82F6" : "#EF4444";

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name={iconName}
            size={moderateScale(40)}
            color={iconColor}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: headerColor }]}>
            {headerTitle}
          </Text>
          <Text style={styles.documentName}>{documentName}</Text>
        </View>

        <View style={styles.attemptBadge}>
          <Text style={styles.attemptText}>
            Attempt #{referral.attemptNumber}
          </Text>
        </View>
      </View>

      {/* Medical Referral Info */}
      {isMedical && referral.doctorName && (
        <View style={styles.medicalInfoSection}>
          <View style={styles.medicalHeader}>
            <Ionicons
              name="medkit"
              size={moderateScale(18)}
              color="#3B82F6"
            />
            <Text style={styles.medicalHeaderText}>Medical Consultation Required</Text>
          </View>

          <View style={styles.doctorInfo}>
            <View style={styles.doctorRow}>
              <Ionicons
                name="person"
                size={moderateScale(16)}
                color="#6B7280"
              />
              <Text style={styles.doctorLabel}>Doctor:</Text>
              <Text style={styles.doctorName}>{referral.doctorName}</Text>
            </View>

            {referral.clinicAddress && (
              <View style={styles.clinicRow}>
                <Ionicons
                  name="location"
                  size={moderateScale(16)}
                  color="#6B7280"
                />
                <Text style={styles.clinicLabel}>Clinic:</Text>
                <Text style={styles.clinicAddress}>{referral.clinicAddress}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Finding/Issue Reason */}
      <View style={styles.reasonSection}>
        <Text style={styles.reasonLabel}>
          {isMedical ? "Medical Finding" : "Issue Detected"}
        </Text>
        <Text style={styles.reasonText}>{referral.reason}</Text>

        {/* Category Badge */}
        <View style={[
          styles.categoryBadge,
          { backgroundColor: isMedical ? '#DBEAFE' : '#FEF3C7' }
        ]}>
          <Ionicons
            name="pricetag"
            size={moderateScale(14)}
            color={isMedical ? "#3B82F6" : "#F59E0B"}
            style={styles.categoryIcon}
          />
          <Text style={[
            styles.categoryText,
            { color: isMedical ? "#1E40AF" : "#92400E" }
          ]}>
            {getCategoryLabel(referral.issueType, referral.category)}
          </Text>
        </View>
      </View>

      {/* Specific Issues */}
      {referral.specificIssues && referral.specificIssues.length > 0 && (
        <View style={styles.issuesSection}>
          <Text style={styles.issuesTitle}>
            {isMedical ? "Details:" : "Issues to Address:"}
          </Text>
          <View style={styles.issuesList}>
            {referral.specificIssues.map((issue: string, index: number) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons
                  name={isMedical ? "information-circle" : "alert-circle"}
                  size={moderateScale(16)}
                  color={isMedical ? "#3B82F6" : "#F59E0B"}
                  style={styles.issueIcon}
                />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Medical Next Steps */}
      {isMedical && (
        <View style={styles.nextStepsSection}>
          <Text style={styles.nextStepsTitle}>📋 Next Steps:</Text>
          <Text style={styles.nextStepsText}>
            1. Visit {referral.doctorName || 'the designated doctor'} for medical consultation{'\n'}
            2. Complete recommended treatment{'\n'}
            3. Return for re-check after treatment{'\n'}
            4. Your application will continue once cleared
          </Text>
          <View style={styles.importantNote}>
            <Ionicons
              name="information-circle"
              size={moderateScale(16)}
              color="#3B82F6"
            />
            <Text style={styles.importantNoteText}>
              Your application is NOT rejected. This is part of the normal process.
            </Text>
          </View>
        </View>
      )}

      {/* Referral/Issue Date */}
      <View style={styles.dateSection}>
        <Ionicons
          name="calendar-outline"
          size={moderateScale(14)}
          color="#9CA3AF"
          style={styles.dateIcon}
        />
        <Text style={styles.dateText}>
          {isMedical ? "Referred" : "Flagged"} on {formatDate(referral.referredAt)}
        </Text>
      </View>

      {/* Replacement Status */}
      {referral.wasReplaced && referral.replacedAt && (
        <View style={styles.replacementStatus}>
          <View style={styles.replacementStatusHeader}>
            <Ionicons
              name="checkmark-circle"
              size={moderateScale(20)}
              color="#10B981"
            />
            <Text style={styles.replacementStatusTitle}>
              {isMedical ? "Re-check Completed" : "Document Resubmitted"}
            </Text>
          </View>
          <Text style={styles.replacementStatusText}>
            {isMedical
              ? `Returned for re-check on ${formatDate(referral.replacedAt)}`
              : `New document submitted on ${formatDate(referral.replacedAt)}`
            }
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showActions && !referral.wasReplaced && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              { backgroundColor: isMedical ? "#3B82F6" : "#EF4444" }
            ]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isMedical ? "medkit" : "cloud-upload-outline"}
              size={moderateScale(18)}
              color="white"
            />
            <Text style={styles.primaryButtonText}>
              {isMedical ? "View Doctor Info" : "Resubmit Document"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
