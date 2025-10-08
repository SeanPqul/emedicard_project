import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { styles } from './ApplicationDetailHeader.styles';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import Svg, { Path } from 'react-native-svg';

interface ApplicationDetailHeaderProps {
  applicationId: string;
  status: string;
  statusColor: string;
  statusIcon: string;
}

export function ApplicationDetailHeader({
  applicationId,
  status,
  statusColor,
  statusIcon,
}: ApplicationDetailHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/application')} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={HEADER_CONSTANTS.ICON_SIZE} color={HEADER_CONSTANTS.WHITE} />
        </TouchableOpacity>

        {/* Header Title and Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Application Details</Text>
          <Text style={styles.applicationId}>#{applicationId}</Text>
        </View>

        {/* Empty spacer for visual balance */}
        <View style={styles.headerRight} />
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

