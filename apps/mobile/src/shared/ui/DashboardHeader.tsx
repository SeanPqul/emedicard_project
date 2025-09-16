import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../styles/theme';
import { Image } from 'expo-image';

interface DashboardHeaderProps {
  greeting: string;
  userName: string;
  userImage?: string;
  currentTime: Date;
  unreadNotificationsCount: number;
  onNotificationPress?: () => void;
}

interface SecondaryAction {
  id: string;
  label: string;
  icon: string;
  route: string;
  accessibilityLabel: string;
  accessibilityHint: string;
}

const SECONDARY_ACTIONS: SecondaryAction[] = [
  {
    id: 'requirements',
    label: 'View Requirements',
    icon: 'document-text-outline',
    route: '/(screens)/(shared)/document-requirements',
    accessibilityLabel: 'View Requirements',
    accessibilityHint: 'View document requirements for health card applications',
  },
  {
    id: 'health-cards',
    label: 'My Health Cards',
    icon: 'card-outline',
    route: '/(screens)/(shared)/health-cards',
    accessibilityLabel: 'My Health Cards',
    accessibilityHint: 'View all your health cards',
  },
  {
    id: 'activity',
    label: 'Activity History',
    icon: 'time-outline',
    route: '/(screens)/(shared)/activity',
    accessibilityLabel: 'Activity History',
    accessibilityHint: 'View your activity history',
  },
  {
    id: 'qr-scanner',
    label: 'Scan QR Code',
    icon: 'scan-outline',
    route: '/(screens)/(shared)/qr-scanner',
    accessibilityLabel: 'Scan QR Code',
    accessibilityHint: 'Scan a QR code',
  },
];

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
  const [showMenu, setShowMenu] = useState(false);

  const handleSecondaryAction = (action: SecondaryAction) => {
    setShowMenu(false);
    router.push(action.route as any);
  };

  return (
    <>
      <View style={styles.header}>
        {/* Left Section - Profile & Greeting */}
        <View style={styles.headerLeft}>
          <View style={styles.profilePicture}>
            <Image
              source={userImage ? { uri: userImage } : null}
              style={styles.profileImage}
              placeholder="👤"
            />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.currentTime}>
              {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Right Section - Action Icons */}
        <View style={styles.headerRight}>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress || (() => router.push('/(tabs)/notification'))}
            accessibilityLabel="Notifications"
            accessibilityHint="View your notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text.primary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Menu Button for More Actions */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowMenu(true)}
            accessibilityLabel="More options"
            accessibilityHint="Open menu for more options"
          >
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu Modal - Secondary actions overflow menu */}
      {/* Provides access to less frequently used but important features */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Quick Actions</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {SECONDARY_ACTIONS.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.menuItem}
                    onPress={() => handleSecondaryAction(action)}
                    accessibilityLabel={action.accessibilityLabel}
                    accessibilityHint={action.accessibilityHint}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color={theme.colors.text.primary}
                      style={styles.menuItemIcon}
                    />
                    <Text style={styles.menuItemText}>{action.label}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.text.tertiary}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[100],
    marginRight: theme.spacing.sm,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
  userName: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  currentTime: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  notificationBadge: {
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
  notificationBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    marginRight: theme.spacing.md,
  },
  menuContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    minWidth: 240,
    maxWidth: 280,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.large,
  },
  menuTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  menuItemIcon: {
    marginRight: theme.spacing.sm,
  },
  menuItemText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
});
