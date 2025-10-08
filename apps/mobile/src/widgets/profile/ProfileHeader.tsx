import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ProfileHeader.styles';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import Svg, { Path } from 'react-native-svg';

interface ProfileHeaderProps {
  displayName: string;
  email?: string;
  memberSince: number;
  imageUrl: string | null;
}

export function ProfileHeader({
  displayName,
  email,
  memberSince,
  imageUrl,
}: ProfileHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.profilePicture}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profilePicture, styles.profilePicturePlaceholder]}>
              <Text style={styles.profilePicturePlaceholderText}>👤</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push('/profile/edit')}
          >
            <Ionicons name="pencil" size={moderateScale(16)} color={HEADER_CONSTANTS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          {email && <Text style={styles.userEmail}>{email}</Text>}
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>
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

