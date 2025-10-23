import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { AttendeeStatus } from '../../lib/types';
import { ATTENDANCE_STATUS } from '../../lib/constants';

interface AttendanceStatusBadgeProps {
  status: AttendeeStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
}

/**
 * Badge component for displaying attendance status with color coding
 * - Green: Completed (checked in and out)
 * - Yellow: Checked In (waiting for check-out)
 * - Gray: Pending (not yet checked in)
 * - Red: Missed (did not attend)
 */
export function AttendanceStatusBadge({
  status,
  size = 'medium',
  showIcon = true,
  showLabel = true,
}: AttendanceStatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeStyles = getSizeStyles(size);

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}15` }, sizeStyles.container]}>
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={sizeStyles.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      {showLabel && (
        <Text style={[styles.label, { color: config.color }, sizeStyles.text]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

/**
 * Get status configuration based on attendee status
 */
function getStatusConfig(status: AttendeeStatus) {
  switch (status) {
    case 'completed':
      return ATTENDANCE_STATUS.COMPLETED;
    case 'checked-in':
      return ATTENDANCE_STATUS.CHECKED_IN;
    case 'pending':
      return ATTENDANCE_STATUS.PENDING;
    case 'missed':
      return ATTENDANCE_STATUS.MISSED;
    default:
      return ATTENDANCE_STATUS.PENDING;
  }
}

/**
 * Get size-specific styles
 */
function getSizeStyles(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: moderateScale(4),
          paddingHorizontal: moderateScale(8),
        },
        iconSize: moderateScale(12),
        text: {
          fontSize: moderateScale(11),
        },
      };
    case 'large':
      return {
        container: {
          paddingVertical: moderateScale(10),
          paddingHorizontal: moderateScale(16),
        },
        iconSize: moderateScale(20),
        text: {
          fontSize: moderateScale(15),
        },
      };
    case 'medium':
    default:
      return {
        container: {
          paddingVertical: moderateScale(6),
          paddingHorizontal: moderateScale(12),
        },
        iconSize: moderateScale(16),
        text: {
          fontSize: moderateScale(13),
        },
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: moderateScale(4),
  },
  label: {
    fontWeight: '600',
  },
});
