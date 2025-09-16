import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../../styles/theme';

interface NotificationButtonProps {
  unreadCount: number;
  onPress?: () => void;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount,
  onPress,
}) => {
  const handlePress = onPress || (() => router.push('/(tabs)/notification'));
  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      accessibilityHint="View your notifications"
      accessibilityState={{ 
        selected: unreadCount > 0,
        disabled: false 
      }}
    >
      <Ionicons 
        name="notifications-outline" 
        size={20} 
        color={theme.colors.text.primary} 
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {displayCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
});
