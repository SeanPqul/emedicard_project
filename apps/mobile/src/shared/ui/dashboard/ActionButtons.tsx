import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { NotificationButton } from './NotificationButton';

interface ActionButtonsProps {
  unreadNotificationsCount: number;
  onNotificationPress?: () => void;
  onMenuPress: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  unreadNotificationsCount,
  onNotificationPress,
  onMenuPress,
}) => {
  return (
    <View style={styles.container}>
      <NotificationButton
        unreadCount={unreadNotificationsCount}
        onPress={onNotificationPress}
      />
      
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="More options"
        accessibilityHint="Open menu for more options"
      >
        <Ionicons 
          name="ellipsis-vertical" 
          size={20} 
          color={theme.colors.text.primary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
});
