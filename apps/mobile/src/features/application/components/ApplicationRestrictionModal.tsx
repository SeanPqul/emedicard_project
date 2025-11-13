/**
 * Application Restriction Modal
 * 
 * Shows a modal when user tries to create a new application but has unresolved ones
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '@/src/shared/utils/responsive';
import { theme } from '@/src/shared/styles/theme';
import { ApplicationStatus } from '@/src/entities/application';
import { getRestrictionMessage } from '../lib/applicationRestrictions';

interface ApplicationRestrictionModalProps {
  visible: boolean;
  onClose: () => void;
  onViewApplication: () => void;
  applicationStatus: ApplicationStatus;
  applicationId: string;
  jobCategory?: string;
}

export function ApplicationRestrictionModal({
  visible,
  onClose,
  onViewApplication,
  applicationStatus,
  applicationId,
  jobCategory,
}: ApplicationRestrictionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={moderateScale(56)} color="#F59E0B" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Application In Progress</Text>

          {/* Message */}
          <Text style={styles.message}>
            {getRestrictionMessage(applicationStatus)}
          </Text>

          {/* Application Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={moderateScale(20)} color="#6B7280" />
              <Text style={styles.infoText}>Application #{applicationId.slice(-8).toUpperCase()}</Text>
            </View>
            {jobCategory && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={moderateScale(20)} color="#6B7280" />
                <Text style={styles.infoText}>{jobCategory}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={moderateScale(20)} color="#6B7280" />
              <Text style={styles.infoText}>Status: {applicationStatus}</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onViewApplication}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>View My Application</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: moderateScale(400),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  message: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  infoContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  infoText: {
    fontSize: moderateScale(13),
    color: '#374151',
    marginLeft: moderateScale(8),
    flex: 1,
  },
  buttonsContainer: {
    gap: moderateScale(12),
  },
  button: {
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2E86AB',
  },
  primaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#374151',
  },
});
