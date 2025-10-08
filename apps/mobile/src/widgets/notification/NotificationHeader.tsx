import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './NotificationHeader.styles';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import Svg, { Path } from 'react-native-svg';

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

export function NotificationHeader({
  unreadCount,
  onMarkAllRead,
}: NotificationHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Notification Icon */}
        <View style={styles.iconBadgeContainer}>
          <Ionicons name="notifications" size={HEADER_CONSTANTS.ICON_SIZE} color={HEADER_CONSTANTS.WHITE} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Header Title and Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.unreadCount}>
            {unreadCount === 0 
              ? 'All caught up!' 
              : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
            }
          </Text>
        </View>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={onMarkAllRead}
          >
            <Ionicons name="checkmark-done" size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE} color={HEADER_CONSTANTS.WHITE} />
          </TouchableOpacity>
        )}
        
        {/* Empty spacer when no unread */}
        {unreadCount === 0 && <View style={styles.headerRight} />}
      </View>

      {/* Curved Wave Bottom */}
      <Svg height="30" width="100%" viewBox="0 0 1440 100" style={styles.wave}>
        <Path
          fill="#fff"
          d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,58.7C1120,53,1280,43,1360,37.3L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
        />
      </Svg>
    </View>
  );
}

