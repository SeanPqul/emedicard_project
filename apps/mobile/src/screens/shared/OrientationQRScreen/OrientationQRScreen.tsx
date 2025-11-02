import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import QRCode from 'react-native-qrcode-svg';
import { BaseScreen } from '@shared/components/core';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';
import { format } from 'date-fns';

/**
 * OrientationQRScreen
 * 
 * Displays the user's orientation QR code for check-in/check-out
 * Inspector scans this QR code twice:
 * 1. When user arrives (Check-In)
 * 2. When orientation completes (Check-Out)
 */
export function OrientationQRScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();

  // Fetch orientation data
  const orientation = useQuery(
    api.admin.orientation.getOrientationByApplicationId,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );

  // Fetch attendance status
  const attendance = useQuery(
    api.orientations.attendance.getAttendanceStatus,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );

  if (!applicationId) {
    return (
      <BaseScreen safeArea={false}>
        <View style={styles.container}>
          <Text style={styles.errorText}>No application ID provided</Text>
        </View>
      </BaseScreen>
    );
  }

  const isLoading = orientation === undefined || attendance === undefined;
  const hasOrientation = orientation && attendance?.hasOrientation;

  const getStatusInfo = () => {
    if (!attendance) return { icon: 'time-outline', text: 'Loading...', color: theme.colors.gray[400] };

    if (attendance.isCheckedOut) {
      return {
        icon: 'checkmark-circle',
        text: 'Orientation Completed',
        color: theme.colors.semantic.success,
        description: 'You have successfully completed your orientation!'
      };
    }

    if (attendance.isCheckedIn) {
      return {
        icon: 'timer-outline',
        text: 'Checked In',
        color: theme.colors.blue[500],
        description: 'Please wait for the orientation to complete, then scan again to check out.'
      };
    }

    return {
      icon: 'scan',
      text: 'Ready for Check-In',
      color: theme.colors.orange[500],
      description: 'Show this QR code to the inspector upon arrival.'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <BaseScreen safeArea={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orientation QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orientation details...</Text>
          </View>
        ) : !hasOrientation ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={moderateScale(60)} color={theme.colors.gray[400]} />
            <Text style={styles.errorTitle}>No Orientation Scheduled</Text>
            <Text style={styles.errorDescription}>
              Please schedule your orientation session first.
            </Text>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => router.push(`/(screens)/(shared)/orientation/schedule?applicationId=${applicationId}`)}
            >
              <Text style={styles.scheduleButtonText}>Schedule Orientation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: statusInfo.color + '15' }]}>
              <Ionicons name={statusInfo.icon as any} size={moderateScale(24)} color={statusInfo.color} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.text}
                </Text>
                {statusInfo.description && (
                  <Text style={styles.statusDescription}>{statusInfo.description}</Text>
                )}
              </View>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={orientation.qrCodeUrl || `EMC-ORIENTATION-${applicationId}`}
                  size={moderateScale(220)}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrLabel}>Show this code to the inspector</Text>
            </View>

            {/* Orientation Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Session Details</Text>
              
              {orientation.scheduledDate && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={moderateScale(20)} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {format(new Date(orientation.scheduledDate), 'MMMM d, yyyy')}
                  </Text>
                </View>
              )}

              {orientation.scheduledTime && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={moderateScale(20)} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>{orientation.scheduledTime}</Text>
                </View>
              )}

              {orientation.venue && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={moderateScale(20)} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>
                    {typeof orientation.venue === 'string' ? orientation.venue : orientation.venue.name}
                  </Text>
                </View>
              )}

              {attendance?.checkInTime && (
                <View style={styles.detailRow}>
                  <Ionicons name="log-in-outline" size={moderateScale(20)} color={theme.colors.semantic.success} />
                  <Text style={styles.detailText}>
                    Checked in: {format(new Date(attendance.checkInTime), 'h:mm a')}
                  </Text>
                </View>
              )}

              {attendance?.checkOutTime && (
                <View style={styles.detailRow}>
                  <Ionicons name="log-out-outline" size={moderateScale(20)} color={theme.colors.semantic.success} />
                  <Text style={styles.detailText}>
                    Checked out: {format(new Date(attendance.checkOutTime), 'h:mm a')}
                  </Text>
                </View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instructions</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Arrive at the venue on time and show this QR code to the inspector for <Text style={styles.bold}>check-in</Text>
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Attend the full orientation session
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Show this QR code again to the inspector for <Text style={styles.bold}>check-out</Text> when the session ends
                </Text>
              </View>
            </View>

            {/* Important Note */}
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle" size={moderateScale(20)} color={theme.colors.blue[600]} />
              <Text style={styles.noteText}>
                Keep your screen brightness high for easy scanning. Both check-in and check-out are required to complete your orientation.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  contentContainer: {
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: moderateScale(40),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(30),
    paddingVertical: verticalScale(60),
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  errorDescription: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  scheduleButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    borderRadius: moderateScale(12),
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  statusText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  statusDescription: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(30),
  },
  qrCodeWrapper: {
    padding: scale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(16),
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
  },
  detailsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  detailText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    marginLeft: scale(12),
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: scale(16),
    borderRadius: moderateScale(12),
  },
  instructionsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  instructionNumber: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: theme.colors.primary[600],
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginRight: scale(12),
  },
  instructionText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(20),
  },
  bold: {
    fontWeight: '700',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.blue[50],
    marginHorizontal: scale(16),
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.blue[600],
  },
  noteText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginLeft: scale(8),
    lineHeight: moderateScale(18),
  },
});
