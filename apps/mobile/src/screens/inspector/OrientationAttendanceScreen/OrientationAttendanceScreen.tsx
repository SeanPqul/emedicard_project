import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { BaseScreen } from '@shared/components/core';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
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
  const [scannerActive, setScannerActive] = useState(true);
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
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not valid for orientation attendance.',
        [{ text: 'OK', onPress: () => setScannerActive(true) }]
      );
      return;
    }

    setIsProcessing(true);
    setScannerActive(false);

    try {
      // Try check-in first, if already checked in it will fail and we'll try check-out
      try {
        const checkInResult = await checkInMutation({ applicationId: parsed.applicationId });
        
        if (checkInResult.success) {
          setLastScannedData({
            applicationId: parsed.applicationId,
            action: 'check-in',
            timestamp: Date.now()
          });

          Alert.alert(
            'Check-In Successful! ✓',
            'Attendee has been checked in for orientation.',
            [{ 
              text: 'OK', 
              onPress: () => {
                setIsProcessing(false);
                setScannerActive(true);
              }
            }]
          );
        } else {
          // Already checked in, try check-out
          const checkOutResult = await checkOutMutation({ applicationId: parsed.applicationId });
          
          if (checkOutResult.success) {
            setLastScannedData({
              applicationId: parsed.applicationId,
              action: 'check-out',
              timestamp: Date.now()
            });

            Alert.alert(
              'Check-Out Successful! ✓',
              'Orientation completed! The application will now proceed to review.',
              [{ 
                text: 'OK', 
                onPress: () => {
                  setIsProcessing(false);
                  setScannerActive(true);
                }
              }]
            );
          } else {
            throw new Error(checkOutResult.message || 'Check-out failed');
          }
        }
      } catch (checkInError: any) {
        // If check-in fails, it might be because they're already checked in
        // Try check-out instead
        if (checkInError.message?.includes('Already checked in') || 
            checkInError.message?.includes('Cannot check in')) {
          const checkOutResult = await checkOutMutation({ applicationId: parsed.applicationId });
          
          if (checkOutResult.success) {
            setLastScannedData({
              applicationId: parsed.applicationId,
              action: 'check-out',
              timestamp: Date.now()
            });

            Alert.alert(
              'Check-Out Successful! ✓',
              'Orientation completed! The application will now proceed to review.',
              [{ 
                text: 'OK', 
                onPress: () => {
                  setIsProcessing(false);
                  setScannerActive(true);
                }
              }]
            );
          } else {
            throw checkInError;
          }
        } else {
          throw checkInError;
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to process attendance',
        [{ 
          text: 'OK', 
          onPress: () => {
            setIsProcessing(false);
            setScannerActive(true);
          }
        }]
      );
    }
  };

  const handleClose = () => {
    setScannerActive(false);
    router.back();
  };

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Orientation Attendance</Text>
            <Text style={styles.headerSubtitle}>Scan QR for check-in/check-out</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scanner or Processing Overlay */}
        {scannerActive && !isProcessing ? (
          <QRCodeScanner
            onScan={handleScan}
            onClose={handleClose}
            active={scannerActive}
            title="Scan Orientation QR"
            subtitle="Align the QR code within the frame"
          />
        ) : (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            <Text style={styles.processingText}>Processing attendance...</Text>
          </View>
        )}

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
      </View>
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
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
  headerSpacer: {
    width: moderateScale(40),
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
