import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotificationList } from '@features/notification/hooks';
import { NotificationWidget } from '@/src/widgets/notification';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

export function NotificationScreen() {
  const {
    notificationsData,
    loading,
    refreshing,
    selectedCategory,
    unreadCount,
    notificationsByDate,
    setSelectedCategory,
    onRefresh,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNotificationNavigation,
    getRelativeTime,
    getDateLabel,
    getFilteredNotifications,
  } = useNotificationList();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <NotificationWidget
      notificationsData={notificationsData}
      refreshing={refreshing}
      selectedCategory={selectedCategory}
      unreadCount={unreadCount}
      notificationsByDate={notificationsByDate}
      onRefresh={onRefresh}
      onCategoryChange={setSelectedCategory}
      onMarkAllRead={handleMarkAllAsRead}
      onMarkAsRead={handleMarkAsRead}
      onNotificationPress={handleNotificationNavigation}
      getRelativeTime={getRelativeTime}
      getDateLabel={getDateLabel}
      getFilteredNotifications={getFilteredNotifications}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
  },
});
