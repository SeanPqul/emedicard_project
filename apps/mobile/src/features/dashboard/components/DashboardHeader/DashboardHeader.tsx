import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { getUserDisplayName } from '@shared/utils/user-utils';
import { DashboardHeaderProps } from '@features/dashboard/types';
import { styles } from './DashboardHeader.styles';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  greeting,
  currentTime,
  unreadNotificationsCount,
}) => {
  const { user } = useUser();

  const formatTime = (date: Date) => {
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dateStr} • ${timeStr}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerLeft}>
        <View style={styles.profilePicture}>
          {(user?.imageUrl || userProfile?.image) ? (
            <Image
              source={{ uri: user?.imageUrl || userProfile?.image }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: moderateScale(24) }}>👤</Text>
          )}
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>Good {greeting}</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {getUserDisplayName(user, userProfile)}
          </Text>
          <Text style={styles.currentTime}>
            {formatTime(currentTime)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton} 
        onPress={() => router.push('/(tabs)/notification')}
        accessibilityLabel="Notifications"
        accessibilityHint="View your notifications"
      >
        <Ionicons 
          name="notifications-outline" 
          size={moderateScale(24)} 
          color={theme.colors.text.primary} 
        />
        {unreadNotificationsCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};