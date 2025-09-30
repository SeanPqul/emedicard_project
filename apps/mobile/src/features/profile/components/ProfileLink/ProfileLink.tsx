import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from '@/src/shared/utils/responsive';

interface ProfileLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
  color?: string;
}

export const ProfileLink: React.FC<ProfileLinkProps> = ({ 
  icon, 
  title, 
  description, 
  onPress, 
  color = '#212529' 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={moderateScale(24)} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={moderateScale(20)} color="#6C757D" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: '#F8F9FA',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginRight: scale(16),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  description: {
    fontSize: moderateScale(12),
    color: '#6C757D',
    marginTop: verticalScale(2),
  },
});
