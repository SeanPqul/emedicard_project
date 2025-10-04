import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RejectionDetailsProps } from './RejectionDetails.types';
import { styles } from './RejectionDetails.styles';
import { moderateScale } from '@shared/utils/responsive';
import { 
  formatRejectionDate,
  RejectionCategoryLabels,
} from '@entities/document';

export const RejectionDetails: React.FC<RejectionDetailsProps> = ({
  rejection,
  onClose,
  onResubmit,
}) => {
  const formattedDate = formatRejectionDate(rejection.rejectedAt);
  const categoryLabel = RejectionCategoryLabels[rejection.rejectionCategory];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Rejection Details</Text>
          <Text style={styles.documentName}>{rejection.documentTypeName}</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={moderateScale(24)}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rejection Information</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{categoryLabel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rejected by:</Text>
          <Text style={styles.detailValue}>{rejection.rejectedByName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formattedDate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Attempt:</Text>
          <Text style={styles.detailValue}>#{rejection.attemptNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reason</Text>
        <Text style={styles.detailValue}>{rejection.rejectionReason}</Text>
      </View>

      {rejection.specificIssues && rejection.specificIssues.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Issues to Address</Text>
          <View style={styles.issuesContainer}>
            {rejection.specificIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <Ionicons
                  name="alert-circle-outline"
                  size={moderateScale(16)}
                  color="#EA580C"
                  style={styles.issueIcon}
                />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[
        styles.statusBadge,
        rejection.wasReplaced ? styles.statusBadgeReplaced : styles.statusBadgeActive
      ]}>
        <Ionicons
          name={rejection.wasReplaced ? "checkmark-circle" : "close-circle"}
          size={moderateScale(20)}
          color={rejection.wasReplaced ? "#10B981" : "#EF4444"}
        />
        <Text style={[
          styles.statusText,
          rejection.wasReplaced ? styles.statusTextReplaced : styles.statusTextActive
        ]}>
          {rejection.wasReplaced ? "Document Resubmitted" : "Awaiting Resubmission"}
        </Text>
      </View>

      {rejection.wasReplaced && rejection.formattedReplacedAt && (
        <View style={styles.replacementInfo}>
          <Text style={styles.replacementText}>
            New document submitted on {rejection.formattedReplacedAt}
          </Text>
        </View>
      )}

      {!rejection.wasReplaced && onResubmit && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.resubmitButton}
            onPress={onResubmit}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={moderateScale(20)}
              color="#FFFFFF"
            />
            <Text style={styles.resubmitButtonText}>Resubmit Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};
