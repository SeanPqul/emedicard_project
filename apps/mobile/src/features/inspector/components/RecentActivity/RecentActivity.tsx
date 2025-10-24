import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

interface RecentScan {
  applicantName: string;
  type: 'check-in' | 'check-out';
  timestamp: number;
}

interface RecentActivityProps {
  scans: RecentScan[];
}

export function RecentActivity({ scans }: RecentActivityProps) {
  const router = useRouter();

  if (scans.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
      </View>

      <View style={styles.card}>
        {scans.slice(0, 3).map((scan, index) => (
          <View key={index} style={[styles.activityItem, index !== 0 && styles.activityItemBorder]}>
            <View style={[styles.iconContainer, {
              backgroundColor: scan.type === 'check-in' 
                ? `${theme.colors.semantic.success}15` 
                : `${theme.colors.purple[500]}15`
            }]}>
              <Ionicons 
                name={scan.type === 'check-in' ? 'checkmark-circle' : 'log-out-outline'} 
                size={moderateScale(20)} 
                color={scan.type === 'check-in' ? theme.colors.semantic.success : theme.colors.purple[500]}
              />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                {scan.applicantName} {scan.type === 'check-in' ? 'checked in' : 'checked out'}
              </Text>
              <Text style={styles.activityTime}>
                {formatTime(scan.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push('/(inspector-tabs)/history')}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All History</Text>
          <Ionicons name="chevron-forward" size={moderateScale(16)} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  header: {
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  activityItemBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(2),
  },
  activityTime: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(8),
  },
  viewAllText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
    marginRight: scale(4),
  },
});
