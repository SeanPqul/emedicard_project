import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../../../styles/theme';

interface ProfileSectionProps {
  greeting: string;
  userName: string;
  userImage?: string;
  currentTime: Date;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  greeting,
  userName,
  userImage,
  currentTime,
}) => {
  const formattedDate = currentTime.toLocaleDateString();
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View style={styles.container}>
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
          {formattedDate} • {formattedTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});
