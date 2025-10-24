import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { DashboardStats } from '../../lib/types';

interface InspectorStatsProps {
  stats: DashboardStats;
}

export function InspectorStats({ stats }: InspectorStatsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>TODAY&apos;S STATS</Text>
      
      <View style={styles.row}>
        <StatCard
          icon="calendar-outline"
          label="Scheduled"
          value={stats.totalScheduled}
          color={theme.colors.blue[500]}
        />
        <StatCard
          icon="checkmark-circle"
          label="Checked In"
          value={stats.checkedIn}
          color={theme.colors.semantic.success}
        />
      </View>

      <View style={styles.row}>
        <StatCard
          icon="log-out-outline"
          label="Checked Out"
          value={stats.checkedOut}
          color={theme.colors.purple[500]}
        />
        <StatCard
          icon="time-outline"
          label="Pending"
          value={stats.pending}
          color={theme.colors.semantic.warning}
        />
      </View>
    </View>
  );
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={moderateScale(24)} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: verticalScale(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginHorizontal: scale(6),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  value: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
