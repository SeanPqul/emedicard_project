import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { theme } from '../../styles/theme';
import { ProfileSection } from './dashboard/ProfileSection';
import { ActionButtons } from './dashboard/ActionButtons';
import { ActionsMenu } from './dashboard/ActionsMenu';
import { useDashboardMenu } from './dashboard/hooks/useDashboardMenu';

interface DashboardHeaderProps {
  greeting: string;
  userName: string;
  userImage?: string;
  currentTime: Date;
  unreadNotificationsCount: number;
  onNotificationPress?: () => void;
}

/**
 * DashboardHeader Component - Unified header for dashboard screen
 * 
 * FEATURES:
 * - User profile display with greeting and time
 * - Quick access to document requirements (most used secondary action)
 * - Notification button with unread count badge
 * - Dropdown menu for additional secondary actions
 * 
 * @param {DashboardHeaderProps} props - Component props
 * @returns {React.ReactElement} Rendered header component
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  userName,
  userImage,
  currentTime,
  unreadNotificationsCount,
  onNotificationPress,
}) => {
  const menuState = useDashboardMenu();

  return (
    <>
      <View style={styles.header}>
        <ProfileSection
          greeting={greeting}
          userName={userName}
          userImage={userImage}
          currentTime={currentTime}
        />
        
        <ActionButtons
          unreadNotificationsCount={unreadNotificationsCount}
          onNotificationPress={onNotificationPress}
          onMenuPress={menuState.openMenu}
        />
      </View>

      <ActionsMenu
        visible={menuState.showMenu}
        onClose={menuState.closeMenu}
        actions={menuState.secondaryActions}
        onActionPress={menuState.handleSecondaryAction}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
