import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { ScanHistoryItem as ScanHistoryItemType } from '../../lib/types';
import { formatTime, formatDuration } from '../../lib/utils';

interface ScanHistoryItemProps {
  scan: ScanHistoryItemType;
}

/**
 * Component for displaying individual scan history event
 * Shows scan type, attendee name, session details, and timestamp
 */
export function ScanHistoryItem({ scan }: ScanHistoryItemProps) {
  const isCheckIn = scan.scanType === 'check-in';
  const iconName = isCheckIn ? 'log-in' : 'log-out';
  const iconColor = isCheckIn ? theme.colors.semantic.info : theme.colors.semantic.success;
  const label = isCheckIn ? 'CHECK-IN' : 'CHECK-OUT';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scanTypeRow}>
          <Ionicons name={iconName} size={moderateScale(18)} color={iconColor} />
          <Text style={[styles.scanTypeLabel, { color: iconColor }]}>{label}</Text>
          <Text style={styles.timestamp}>{formatTime(scan.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Ionicons
            name="person"
            size={moderateScale(16)}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.attendeeName}>{scan.attendeeName}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons
            name="time-outline"
            size={moderateScale(14)}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.detailsText}>{scan.sessionScheduledTime}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons
            name="location-outline"
            size={moderateScale(14)}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.detailsText}>{scan.sessionVenue}</Text>
        </View>

        {scan.duration && (
          <View style={styles.durationRow}>
            <Ionicons
              name="hourglass-outline"
              size={moderateScale(14)}
              color={theme.colors.semantic.success}
            />
            <Text style={styles.durationText}>
              Duration: {formatDuration(scan.timestamp - scan.duration, scan.timestamp)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[500],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: verticalScale(12),
  },
  scanTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  scanTypeLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 'auto',
  },
  content: {
    gap: verticalScale(6),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  attendeeName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  detailsText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(4),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  durationText: {
    fontSize: moderateScale(12),
    color: theme.colors.semantic.success,
    fontWeight: '600',
  },
});
