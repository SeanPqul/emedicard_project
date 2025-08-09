import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getColor, getTypography, getSpacing, getBorderRadius } from '../styles/theme';

interface UnauthorizedAccessProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  title = "Access Restricted",
  message = "You don't have permission to view this content. Please contact your administrator if you believe this is an error.",
  onGoBack,
  showBackButton = true,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="lock-closed" 
            size={64} 
            color={getColor('semantic.warning')} 
          />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityLabel="Go back to previous screen"
            accessibilityRole="button"
          >
            <Ionicons 
              name="arrow-back" 
              size={20} 
              color={getColor('background.primary')} 
            />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing('xl'),
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: getSpacing('xl'),
    padding: getSpacing('lg'),
    backgroundColor: getColor('semantic.warning') + '20',
    borderRadius: getBorderRadius('full'),
  },
  title: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('md'),
  },
  message: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: getSpacing('xl'),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('primary.500'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
  },
  backButtonText: {
    ...getTypography('bodyMedium'),
    color: getColor('background.primary'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
});
