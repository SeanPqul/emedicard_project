import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { BaseScreen } from '@shared/components/core';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { useToast } from '@shared/components';
import type { Id } from '@backend/convex/_generated/dataModel';
import { QRCodeScanner } from '@features/scanner/components';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

/**
 * OrientationAttendanceScreen
 * 
 * Inspector screen for scanning user QR codes
 * Handles check-in and check-out for orientation attendance
 */
export function OrientationAttendanceScreen() {
  const { showToast } = useToast();
  const [scannerActive, setScannerActive] = useState(false); // Start with scanner OFF
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<{
    applicationId: string;
    action: 'check-in' | 'check-out';
    timestamp: number;
  } | null>(null);

  // Mutations
  const checkInMutation = useMutation(api.orientations.attendance.checkIn);
  const checkOutMutation = useMutation(api.orientations.attendance.checkOut);

  const parseQRData = (data: string): { applicationId: Id<"applications"> } | null => {
    try {
      // Format: EMC-ORIENTATION-{applicationId}
      if (data.startsWith('EMC-ORIENTATION-')) {
        const applicationId = data.replace('EMC-ORIENTATION-', '');
        return { applicationId: applicationId as Id<"applications"> };
      }
      return null;
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  };

  const handleScan = async (data: string) => {
    if (isProcessing) return;

    const parsed = parseQRData(data);
    
    if (!parsed) {
      showToast('Invalid QR code for orientation attendance', 'error', 4000);
      setScannerActive(true);
      return;
    }

    setIsProcessing(true);
    setScannerActive(false);

    try {
      // Try check-in first
      const checkInResult = await checkInMutation({ applicationId: parsed.applicationId });
      
      if (checkInResult.success) {
        // Successful check-in
        setLastScannedData({
          applicationId: parsed.applicationId,
          action: 'check-in',
          timestamp: Date.now()
        });

        showToast('✓ Check-In Successful! Attendee checked in for orientation.', 'success', 3000);
        setIsProcessing(false);
        setScannerActive(true);
      } else {
        // Already checked in, try check-out
        const checkOutResult = await checkOutMutation({ applicationId: parsed.applicationId });
        
        if (checkOutResult.success) {
          // Successful check-out
          setLastScannedData({
            applicationId: parsed.applicationId,
            action: 'check-out',
            timestamp: Date.now()
          });

          showToast('✓ Check-Out Successful! Orientation completed.', 'success', 3000);
          setIsProcessing(false);
          setScannerActive(true);
        } else {
          // Already checked out - duplicate scan detected
          const checkOutTime = new Date(checkOutResult.checkOutTime || 0).toLocaleTimeString();
          showToast(
            `⚠️ Already Checked Out\nThis attendee completed orientation at ${checkOutTime}`, 
            'warning', 
            4000
          );
          setIsProcessing(false);
          setScannerActive(true);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process attendance';
      
      // Enhanced error feedback with better UX
      if (errorMessage.includes('scheduled for')) {
        // Wrong date error - make it very clear
        showToast(
          `📅 Wrong Date\n${errorMessage}`,
          'error',
          5000 // Longer duration for important errors
        );
      } else if (errorMessage.includes('requires minimum')) {
        // Duration not met error - helpful feedback
        showToast(
          `⏱️ Too Early\n${errorMessage}`,
          'warning',
          5000
        );
      } else if (errorMessage.includes('Cannot check out without checking in')) {
        // Not checked in yet
        showToast(
          `⚠️ Not Checked In\nThis attendee must check in first before checking out.`,
          'error',
          4000
        );
      } else {
        // Generic error
        showToast(errorMessage, 'error', 4000);
      }
      
      setIsProcessing(false);
      setScannerActive(true);
    }
  };

  const handleToggleScanner = () => {
    setScannerActive(!scannerActive);
  };

  const handleStartScanning = () => {
    setScannerActive(true);
  };

  return (
    <BaseScreen safeArea={false}>
      {scannerActive && !isProcessing ? (
        // Full screen scanner
        <QRCodeScanner
          onScan={handleScan}
          onClose={handleToggleScanner}
          active={scannerActive}
          title="Scan Orientation QR"
          subtitle="Align the QR code within the frame"
        />
      ) : (
        // Normal UI when scanner is not active
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="qr-code" size={moderateScale(28)} color={theme.colors.primary[500]} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Scanner</Text>
              <Text style={styles.headerSubtitle}>Scan QR for check-in/check-out</Text>
            </View>
          </View>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.processingText}>Processing attendance...</Text>
            </View>
          ) : (
            <>
              {/* Last Scanned Info */}
              {lastScannedData && (
                <View style={styles.lastScannedContainer}>
                  <Ionicons 
                    name={lastScannedData.action === 'check-in' ? 'log-in' : 'log-out'} 
                    size={moderateScale(24)} 
                    color={theme.colors.semantic.success} 
                  />
                  <View style={styles.lastScannedTextContainer}>
                    <Text style={styles.lastScannedTitle}>
                      Last {lastScannedData.action === 'check-in' ? 'Check-In' : 'Check-Out'}
                    </Text>
                    <Text style={styles.lastScannedTime}>
                      {new Date(lastScannedData.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Start Scanning Button */}
              <View style={styles.scanButtonContainer}>
                <TouchableOpacity 
                  style={styles.startScanButton}
                  onPress={handleStartScanning}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={moderateScale(32)} color="#FFFFFF" />
                  <Text style={styles.startScanButtonText}>Start Scanning</Text>
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions</Text>
                <View style={styles.instructionItem}>
                  <Ionicons name="qr-code-outline" size={moderateScale(20)} color={theme.colors.primary[600]} />
                  <Text style={styles.instructionText}>
                    Scan attendee's QR code when they arrive for check-in
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="qr-code-outline" size={moderateScale(20)} color={theme.colors.primary[600]} />
                  <Text style={styles.instructionText}>
                    Scan the same QR code again when orientation completes for check-out
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="information-circle-outline" size={moderateScale(20)} color={theme.colors.blue[600]} />
                  <Text style={styles.instructionText}>
                    The system automatically detects whether to check-in or check-out
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(16),
  },
  lastScannedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.success + '15',
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.semantic.success,
  },
  lastScannedTextContainer: {
    marginLeft: scale(12),
  },
  lastScannedTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  lastScannedTime: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginVertical: verticalScale(32),
  },
  startScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(50),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minWidth: scale(200),
  },
  startScanButtonText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: scale(12),
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
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
    marginBottom: verticalScale(10),
  },
  instructionText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    marginLeft: scale(12),
    lineHeight: moderateScale(20),
  },
});
