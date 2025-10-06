import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RejectionDetailsProps } from './RejectionDetails.types';
import { styles } from './RejectionDetails.styles';
import { moderateScale } from '@shared/utils/responsive';
import { 
  formatRejectionDate,
} from '@entities/document';

export const RejectionDetails: React.FC<RejectionDetailsProps> = ({
  rejection,
  onClose,
  onResubmit,
}) => {
  const formattedDate = rejection?.rejectedAt 
  ? String(formatRejectionDate(rejection.rejectedAt))
  : '';


  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Additional Details</Text>
          <Text style={styles.documentName}>{rejection.documentTypeName || ''}</Text>
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
        <Text style={styles.sectionTitle}>Review Information</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reviewed by:</Text>
          <Text style={styles.detailValue}>{rejection.rejectedByName || 'Unknown'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Review date:</Text>
          <Text style={styles.detailValue}>{formattedDate || ''}</Text>
        </View>

        {rejection.rejectedByRole ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reviewer role:</Text>
            <Text style={styles.detailValue}>{rejection.rejectedByRole || ''}</Text>
          </View>
        ) : null}
      </View>

      {(rejection.originalFileName || rejection.fileSize || rejection.fileType) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Information</Text>
          {rejection.originalFileName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File name:</Text>
              <Text style={styles.detailValue}>{rejection.originalFileName || ''}</Text>
            </View>
          )}

          {rejection.fileType && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File type:</Text>
              <Text style={styles.detailValue}>{rejection.fileType || ''}</Text>
            </View>
          )}

          {rejection.fileSize && rejection.fileSize > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>File size:</Text>
              <Text style={styles.detailValue}>{(rejection.fileSize / 1024).toFixed(2)} KB</Text>
            </View>
          )}
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
