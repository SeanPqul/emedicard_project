import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { useInspectorDashboard } from '@features/inspector/hooks';
import { SessionWithStats } from '@features/inspector/lib/types';
import { QRCodeScanner } from '@features/scanner/components/QRCodeScanner/QRCodeScanner';
import { useToast } from '@shared/components';

export function InspectorScannerScreen() {
  const { data: dashboardData, isLoading } = useInspectorDashboard();
  const { showToast } = useToast();
  const [selectedSession, setSelectedSession] = useState<SessionWithStats | null>(null);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    type: 'check-in' | 'check-out' | null;
    attendeeName?: string;
    time?: string;
  }>({ visible: false, type: null });
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  // Mutations for check-in/check-out
  const checkInMutation = useMutation(api.orientations.attendance.checkIn);
  const checkOutMutation = useMutation(api.orientations.attendance.checkOut);

  // Auto-update when session status changes (upcoming -> active)
  useEffect(() => {
    if (dashboardData) {
      const activeSession = dashboardData.allSessions.find(s => s.isActive);
      
      // Auto-select active session if none selected
      if (!selectedSession && activeSession) {
        setSelectedSession(activeSession);
        // DON'T return early - continue to update logic below
      }
      
      // Update if selected session became active or inactive
      if (selectedSession) {
        const updatedSession = dashboardData.allSessions.find(
          s => s._id === selectedSession._id
        );
        
        if (updatedSession) {
          // Always update session data (venue, status, stats, etc.)
          // This ensures real-time updates when session transitions
          setSelectedSession(updatedSession);
        } else if (activeSession) {
          // If selected session no longer exists, switch to active one
          setSelectedSession(activeSession);
        } else {
          // No active session available
          setSelectedSession(null);
        }
      }
    }
  }, [dashboardData, selectedSession]);

  // Categorize sessions by status
  const categorizedSessions = useMemo(() => {
    const sessions = dashboardData?.allSessions || [];
    return {
      active: sessions.filter(s => s.isActive),
      upcoming: sessions.filter(s => s.isFuture),
      past: sessions.filter(s => s.isPast),
    };
  }, [dashboardData]);

  const handleSessionSelect = (session: SessionWithStats, isActive: boolean) => {
    // Only allow selection if session is active
    if (isActive) {
      setSelectedSession(session);
      setShowSessionPicker(false);
    } else {
      Alert.alert(
        'Session Not Active',
        'You can only scan for active sessions. Past and upcoming sessions cannot be selected.',
        [{ text: 'OK' }]
      );
    }
  };

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

    // Prevent duplicate scans within 5 seconds
    const now = Date.now();
    const COOLDOWN_MS = 5000; // 5 seconds
    
    if (data === lastScannedData && (now - lastScanTime) < COOLDOWN_MS) {
      console.log('[Scanner] Ignoring duplicate scan within cooldown period');
      return;
    }

    const parsed = parseQRData(data);
    
    if (!parsed) {
      showToast('Invalid QR code for orientation attendance', 'error', 4000);
      return;
    }

    // Update last scan tracking
    setLastScannedData(data);
    setLastScanTime(now);

    setIsProcessing(true);
    // Don't close scanner - keep camera open for next scan

    try {
      // Try check-in first
      let checkedIn = false;
      
      try {
        const checkInResult = await checkInMutation({ applicationId: parsed.applicationId });
        
        if (checkInResult.success) {
          // Successful check-in - show modal
          setSuccessModal({
            visible: true,
            type: 'check-in',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          });
          checkedIn = true;
        } else {
          // Already checked in (returned success: false), try check-out
          checkedIn = false;
        }
      } catch (checkInError) {
        // Check-in failed - likely already checked in or no booking
        console.log('[Scanner] Check-in failed:', checkInError);
        checkedIn = false;
      }
      
      // If check-in didn't succeed, try check-out
      if (!checkedIn) {
        try {
          const checkOutResult = await checkOutMutation({ applicationId: parsed.applicationId });
          
          if (checkOutResult.success) {
            // Successful check-out - show modal
            setSuccessModal({
              visible: true,
              type: 'check-out',
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            });
          } else {
            // Already checked out
            const checkOutTime = new Date(checkOutResult.checkOutTime || 0).toLocaleTimeString();
            showToast(
              `⚠️ Already Checked Out\nThis attendee completed orientation at ${checkOutTime}`, 
              'warning', 
              4000
            );
          }
        } catch (checkOutError) {
          // Checkout also failed - likely no booking at all or already completed
          console.log('[Scanner] Check-out also failed:', checkOutError);
          const errorMsg = checkOutError instanceof Error ? checkOutError.message : '';
          
          if (errorMsg.includes('No checked-in orientation')) {
            showToast('✅ Already Completed\nThis attendee has already completed orientation.', 'info', 4000);
          } else {
            // Re-throw to be handled by outer catch
            throw checkOutError;
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process attendance';
      
      // Enhanced error feedback
      if (errorMessage.includes('scheduled for')) {
        showToast(`📅 Wrong Date\n${errorMessage}`, 'error', 5000);
      } else if (errorMessage.includes('requires minimum')) {
        showToast(`⏱️ Too Early\n${errorMessage}`, 'warning', 5000);
      } else if (errorMessage.includes('Cannot check out without checking in')) {
        showToast('⚠️ Not Checked In\nThis attendee must check in first before checking out.', 'error', 4000);
      } else if (errorMessage.includes('No orientation scheduled') || errorMessage.includes('No checked-in orientation')) {
        // This happens when trying to scan someone who already completed or has no booking
        showToast('✅ Already Processed\nThis attendee has already completed orientation or has no active booking.', 'info', 4000);
      } else {
        showToast(errorMessage, 'error', 4000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenScanner = () => {
    if (!selectedSession) {
      Alert.alert(
        'No Session Selected',
        'Please select a session first before scanning.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowScanner(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasNoSessions = !dashboardData || 
    (categorizedSessions.active.length === 0 && 
     categorizedSessions.upcoming.length === 0 && 
     categorizedSessions.past.length === 0);

  if (hasNoSessions) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={moderateScale(64)} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Sessions Today</Text>
          <Text style={styles.emptyText}>
            There are no orientation sessions scheduled for today. Check back when sessions are available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Session Selector Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>Scanning for Session:</Text>
          <TouchableOpacity
            style={styles.sessionSelector}
            onPress={() => setShowSessionPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.sessionSelectorContent}>
              <View style={styles.sessionInfo}>
                <View style={styles.sessionTimeRow}>
                  <Ionicons name="time" size={moderateScale(16)} color={theme.colors.primary[600]} />
                  <Text style={styles.sessionTime}>{selectedSession?.scheduledTime || 'No session'}</Text>
                  {selectedSession?.isActive && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <View style={styles.sessionVenueRow}>
                  <Ionicons name="location" size={moderateScale(14)} color={theme.colors.text.secondary} />
                  <Text style={styles.sessionVenue}>{selectedSession?.venue || 'No venue'}</Text>
                </View>
                {selectedSession && (
                  <Text style={styles.sessionProgress}>
                    {selectedSession.stats.checkedIn}/{selectedSession.stats.totalAttendees} checked in
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={moderateScale(20)} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Scanner Placeholder or Processing */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scannerContainer}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.processingText}>Processing attendance...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.scannerPlaceholder}
              onPress={handleOpenScanner}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={moderateScale(80)} color={theme.colors.primary[500]} />
              <Text style={styles.scannerTitle}>Tap to Scan QR Code</Text>
              <Text style={styles.scannerSubtitle}>
                Scan attendee QR codes for check-in/check-out
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* QR Code Scanner Modal */}
      {showScanner && selectedSession && (
        <Modal
          visible={showScanner}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowScanner(false)}
        >
          <QRCodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
            active={showScanner}
            title="Scan QR Code"
            subtitle={`Scanning for ${selectedSession.scheduledTime}`}
          />
        </Modal>
      )}

      {/* Session Picker Modal */}
      <Modal
        visible={showSessionPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSessionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSessionPicker(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Session</Text>
              <TouchableOpacity onPress={() => setShowSessionPicker(false)}>
                <Ionicons name="close" size={moderateScale(24)} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sessionList} showsVerticalScrollIndicator={false}>
              {/* Active Sessions */}
              {categorizedSessions.active.length > 0 && (
                <View style={styles.sessionCategory}>
                  <Text style={styles.categoryTitle}>ACTIVE NOW</Text>
                  {categorizedSessions.active.map((session) => (
                    <SessionOptionCard
                      key={session._id}
                      session={session}
                      isSelected={session._id === selectedSession?._id}
                      isActive={true}
                      isDisabled={false}
                      onSelect={() => handleSessionSelect(session, true)}
                    />
                  ))}
                </View>
              )}

              {/* Upcoming Sessions */}
              {categorizedSessions.upcoming.length > 0 && (
                <View style={styles.sessionCategory}>
                  <Text style={styles.categoryTitle}>UPCOMING TODAY</Text>
                  {categorizedSessions.upcoming.map((session) => (
                    <SessionOptionCard
                      key={session._id}
                      session={session}
                      isSelected={session._id === selectedSession?._id}
                      isActive={false}
                      isDisabled={true}
                      onSelect={() => handleSessionSelect(session, false)}
                    />
                  ))}
                </View>
              )}

              {/* Past Sessions */}
              {categorizedSessions.past.length > 0 && (
                <View style={styles.sessionCategory}>
                  <Text style={styles.categoryTitle}>PAST</Text>
                  {categorizedSessions.past.map((session) => (
                    <SessionOptionCard
                      key={session._id}
                      session={session}
                      isSelected={session._id === selectedSession?._id}
                      isActive={false}
                      isDisabled={true}
                      onSelect={() => handleSessionSelect(session, false)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      {successModal.visible && successModal.type && (
        <Modal
          visible={successModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setSuccessModal({ visible: false, type: null })}
        >
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              <View style={[
                styles.successIconContainer,
                { backgroundColor: successModal.type === 'check-in' ? theme.colors.success[50] : theme.colors.primary[50] }
              ]}>
                <Ionicons 
                  name={successModal.type === 'check-in' ? 'checkmark-circle' : 'exit-outline'} 
                  size={moderateScale(48)} 
                  color={successModal.type === 'check-in' ? theme.colors.success[600] : theme.colors.primary[600]} 
                />
              </View>
              <Text style={styles.successTitle}>
                {successModal.type === 'check-in' ? 'Checked In' : 'Checked Out'}
              </Text>
              <Text style={styles.successTime}>{successModal.time}</Text>
              <TouchableOpacity 
                style={styles.successButton}
                onPress={() => setSuccessModal({ visible: false, type: null })}
              >
                <Text style={styles.successButtonText}>Continue Scanning</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerContent: {
    gap: verticalScale(8),
  },
  headerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionSelector: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  sessionSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(12),
  },
  sessionInfo: {
    flex: 1,
    gap: verticalScale(4),
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  sessionTime: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  sessionVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  sessionVenue: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  sessionProgress: {
    fontSize: moderateScale(12),
    color: theme.colors.semantic.success,
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.semantic.error}15`,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    gap: scale(4),
  },
  liveDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: theme.colors.semantic.error,
  },
  liveText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: theme.colors.semantic.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(100), // Space for tab bar
  },
  scannerContainer: {
    flex: 1,
    padding: scale(16),
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
  },
  processingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(16),
  },
  scannerPlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  scannerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
  },
  scannerSubtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(8),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  sessionList: {
    padding: scale(16),
  },
  sessionOption: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sessionOptionSelected: {
    backgroundColor: `${theme.colors.primary[500]}10`,
    borderColor: theme.colors.primary[500],
  },
  sessionOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
  },
  sessionOptionInfo: {
    flex: 1,
    gap: verticalScale(4),
  },
  sessionOptionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  sessionOptionTime: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  liveBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.semantic.error}15`,
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
    gap: scale(3),
  },
  liveDotSmall: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: theme.colors.semantic.error,
  },
  liveTextSmall: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: theme.colors.semantic.error,
  },
  upcomingBadge: {
    backgroundColor: `${theme.colors.primary[500]}15`,
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  upcomingText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: theme.colors.primary[500],
  },
  sessionOptionVenue: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  sessionOptionCapacity: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
  },
  sessionCategory: {
    marginBottom: verticalScale(20),
  },
  categoryTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(4),
  },
  sessionOptionDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.background.secondary,
  },
  sessionOptionTimeDisabled: {
    color: theme.colors.text.tertiary,
  },
  sessionOptionVenueDisabled: {
    color: theme.colors.text.tertiary,
  },
  sessionOptionCapacityDisabled: {
    color: theme.colors.text.tertiary,
  },
  pastBadge: {
    backgroundColor: `${theme.colors.text.tertiary}15`,
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  pastText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
  },
  successModalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(20),
    padding: moderateScale(32),
    alignItems: 'center',
    width: '100%',
    maxWidth: scale(320),
  },
  successIconContainer: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  successTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  successTime: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(24),
  },
  successButton: {
    backgroundColor: theme.colors.primary[600],
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(32),
    width: '100%',
  },
  successButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.background.primary,
    textAlign: 'center',
  },
});

// Session Option Card Component
interface SessionOptionCardProps {
  session: SessionWithStats;
  isSelected: boolean;
  isActive: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

const SessionOptionCard: React.FC<SessionOptionCardProps> = ({
  session,
  isSelected,
  isActive,
  isDisabled,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.sessionOption,
        isSelected && styles.sessionOptionSelected,
        isDisabled && styles.sessionOptionDisabled,
      ]}
      onPress={onSelect}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled && !isSelected}
    >
      <View style={styles.sessionOptionContent}>
        <View style={styles.sessionOptionInfo}>
          <View style={styles.sessionOptionTimeRow}>
            <Text style={[
              styles.sessionOptionTime,
              isDisabled && styles.sessionOptionTimeDisabled,
            ]}>
              {session.scheduledTime}
            </Text>
            {isActive && (
              <View style={styles.liveBadgeSmall}>
                <View style={styles.liveDotSmall} />
                <Text style={styles.liveTextSmall}>LIVE</Text>
              </View>
            )}
            {session.isFuture && (
              <View style={[styles.upcomingBadge, isDisabled && { opacity: 0.5 }]}>
                <Text style={styles.upcomingText}>UPCOMING</Text>
              </View>
            )}
            {session.isPast && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastText}>ENDED</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.sessionOptionVenue,
            isDisabled && styles.sessionOptionVenueDisabled,
          ]}>
            {session.venue}
          </Text>
          <Text style={[
            styles.sessionOptionCapacity,
            isDisabled && styles.sessionOptionCapacityDisabled,
          ]}>
            {session.currentBookings}/{session.maxCapacity} attendees
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={moderateScale(24)}
            color={isDisabled ? theme.colors.text.tertiary : theme.colors.primary[500]}
          />
        )}
        {isDisabled && !isSelected && (
          <Ionicons
            name="lock-closed"
            size={moderateScale(20)}
            color={theme.colors.text.tertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

