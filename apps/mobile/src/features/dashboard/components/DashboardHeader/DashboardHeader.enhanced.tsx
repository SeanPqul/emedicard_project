import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { DashboardHeaderProps } from '@features/dashboard/types';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { format } from 'date-fns';
import { styles } from './DashboardHeader.enhanced.styles';

export const DashboardHeaderEnhanced: React.FC<DashboardHeaderProps> = ({
  userProfile,
  greeting,
  currentTime,
  unreadNotificationsCount,
}) => {
  const { user } = useUser();
  const profileImageUrl = user?.imageUrl || userProfile?.image;

  const getProfileInitials = () => {
    if (!userProfile?.fullname) return 'U';
    const names = userProfile.fullname.split(' ');
    return names
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeOfDayEmoji = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return '☀️'; // Morning
    if (hour >= 12 && hour < 17) return '🌤️'; // Afternoon
    if (hour >= 17 && hour < 21) return '🌅'; // Evening
    return '🌙'; // Night
  };

  return (
    <View
      style={[styles.gradientContainer, { backgroundColor: theme.colors.primary[500] }]}
    >
      <View style={styles.container}>
        {/* Top Row - Date and Notifications */}
        <View style={styles.topRow}>
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={moderateScale(16)} 
              color={theme.colors.ui.white} 
              style={styles.dateIcon}
            />
            <Text style={styles.dateText}>
              {format(currentTime, 'EEEE, MMM d')}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/notification')}
            accessibilityLabel={`Notifications, ${unreadNotificationsCount} unread`}
          >
            <View style={styles.notificationIconContainer}>
              <Ionicons 
                name="notifications-outline" 
                size={moderateScale(24)} 
                color={theme.colors.ui.white}
              />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content - Profile and Greeting */}
        <View style={styles.mainContent}>
          <TouchableOpacity 
            style={styles.profileSection}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Go to profile"
          >
            {profileImageUrl ? (
              <Image 
                source={{ uri: profileImageUrl }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {getProfileInitials()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.greetingSection}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>
                {greeting} {getTimeOfDayEmoji()}
              </Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {userProfile?.fullname || 'User'}
            </Text>
            <Text style={styles.welcomeMessage}>
              Ready to manage your health cards?
            </Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <Ionicons 
              name="shield-checkmark" 
              size={moderateScale(20)} 
              color={theme.colors.ui.white}
            />
            <Text style={styles.quickStatText}>Active</Text>
          </View>
          
          <View style={styles.quickStatDivider} />
          
          <TouchableOpacity 
            style={styles.quickStatItem}
            onPress={() => router.push('/(tabs)/application')}
          >
            <Ionicons 
              name="time-outline" 
              size={moderateScale(20)} 
              color={theme.colors.ui.white}
            />
            <Text style={styles.quickStatText}>Track Status</Text>
          </TouchableOpacity>
          
          <View style={styles.quickStatDivider} />
          
          <TouchableOpacity 
            style={styles.quickStatItem}
            onPress={() => router.push('/(screens)/(shared)/qr-code')}
          >
            <Ionicons 
              name="qr-code-outline" 
              size={moderateScale(20)} 
              color={theme.colors.ui.white}
            />
            <Text style={styles.quickStatText}>View QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Decorative wave at bottom */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </View>
  );
};
