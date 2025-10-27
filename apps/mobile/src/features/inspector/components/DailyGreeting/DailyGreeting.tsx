import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

interface DailyGreetingProps {
  inspectorName: string;
  totalSessions: number;
  totalAttendees: number;
}

export function DailyGreeting({ inspectorName, totalSessions, totalAttendees }: DailyGreetingProps) {
  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {greeting}, {inspectorName} 👋
      </Text>
      <Text style={styles.summary}>
        {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'} today • {totalAttendees} total attendees
      </Text>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  greeting: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  summary: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
});
