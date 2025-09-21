import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';
import { getUserDisplayName } from '../../utils/user-utils';

interface DashboardHeaderProps {
  userProfile: any;
  greeting: string;
  currentTime: Date;
  unreadNotificationsCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  greeting,
  currentTime,
  unreadNotificationsCount,
}) => {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.headerLeft}>
        <View style={styles.profilePicture}>
          <Image
            source={{ uri: user?.imageUrl || userProfile?.image }}
            style={styles.profileImage}
            placeholder="👤"
          />
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>Good {greeting}</Text>
          <Text style={styles.userName}>
            {getUserDisplayName(user, userProfile)}
          </Text>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton} 
        onPress={() => router.push('/(tabs)/notification')}
        accessibilityLabel="Notifications"
        accessibilityHint="View your notifications"
      >
        <Ionicons name="notifications-outline" size={24} color={getColor('text.primary')} />
        {unreadNotificationsCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {unreadNotificationsCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('sm'),
    backgroundColor: getColor('border.light'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: getBorderRadius('full'),
  },
  welcomeText: {
    flex: 1,
    marginRight: getSpacing('sm'),
    minWidth: 0,
  },
  greeting: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
  },
  userName: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginTop: getSpacing('xs') / 2,
  },
  currentTime: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('xs') / 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: -getSpacing('sm'),
  },
  notificationBadge: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
    backgroundColor: getColor('semantic.error'),
    borderRadius: getBorderRadius('full'),
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
});
