import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '@shared/styles/theme';
import { CustomButton } from '@features/upload/components/ui/Button';

interface DragDropUploadProps {
  onFilesSelected: (files: any[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesSelected,
  acceptedFormats = ['jpg', 'jpeg', 'png', 'pdf'],
  maxFiles = 5,
  maxFileSize = 10,
  disabled = false,
  loading = false,
  title = 'Drop files here or click to browse',
  subtitle = 'Support for PDF, JPG, PNG files up to 10MB',
  icon = 'cloud-upload-outline',
  accessibilityLabel = 'File upload area',
  accessibilityHint = 'Tap to select files or drag files here',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [borderColorAnim] = useState(new Animated.Value(0));

  const animateScale = useCallback((toValue: number) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [scaleAnim]);

  const animateBorderColor = useCallback((toValue: number) => {
    Animated.timing(borderColorAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [borderColorAnim]);

  const handleDragEnter = useCallback(() => {
    if (disabled || loading) return;
    setDragActive(true);
    animateScale(0.98);
    animateBorderColor(1);
  }, [disabled, loading, animateScale, animateBorderColor]);

  const handleDragLeave = useCallback(() => {
    if (disabled || loading) return;
    setDragActive(false);
    animateScale(1);
    animateBorderColor(0);
  }, [disabled, loading, animateScale, animateBorderColor]);

  const handlePress = useCallback(async () => {
    if (disabled || loading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedFormats.map(format => {
          if (format === 'pdf') return 'application/pdf';
          if (format === 'jpeg' || format === 'jpg') return 'image/jpeg';
          if (format === 'png') return 'image/png';
          return '*/*';
        }),
        multiple: maxFiles > 1,
      });

      if (!result.canceled && result.assets) {
        onFilesSelected(result.assets);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Could not select files. Please try again.');
    }
  }, [disabled, loading, onFilesSelected, acceptedFormats, maxFiles]);

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [getColor('border.medium'), getColor('primary.500')],
  });

  const backgroundColor = dragActive 
    ? getColor('primary.50') 
    : disabled 
      ? getColor('background.tertiary') 
      : getColor('background.primary');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      <Animated.View
        style={[
          styles.dropZone,
          {
            borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, dragActive && styles.iconContainerActive]}>
            {loading ? (
              <Ionicons 
                name="sync" 
                size={48} 
                color={getColor('primary.500')} 
                style={styles.loadingIcon}
              />
            ) : (
              <Ionicons 
                name={icon} 
                size={48} 
                color={dragActive ? getColor('primary.600') : getColor('primary.500')} 
              />
            )}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              dragActive && styles.titleActive,
              disabled && styles.titleDisabled,
            ]}>
              {loading ? 'Uploading...' : title}
            </Text>
            
            <Text style={[
              styles.subtitle,
              disabled && styles.subtitleDisabled,
            ]}>
              {loading ? 'Please wait while files are being uploaded' : subtitle}
            </Text>
          </View>

          {/* File Format Indicators */}
          <View style={styles.formatContainer}>
            {acceptedFormats.map((format) => (
              <View key={format} style={styles.formatBadge}>
                <Text style={styles.formatText}>{format.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          {/* Browse Button */}
          <CustomButton
            title="Browse Files"
            variant="outline"
            size="small"
            onPress={handlePress}
            disabled={disabled || loading}
            loading={loading}
            loadingText="Uploading..."
            buttonStyle={styles.browseButton}
            textStyle={styles.browseButtonText}
            accessibilityLabel="Browse files button"
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: getBorderRadius('lg'),
    overflow: 'hidden',
    ...getShadow('small'),
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('xl'),
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: getColor('primary.50'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  iconContainerActive: {
    backgroundColor: getColor('primary.100'),
  },
  loadingIcon: {
    // Add rotation animation if needed
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  title: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('xs'),
  },
  titleActive: {
    color: getColor('primary.600'),
  },
  titleDisabled: {
    color: getColor('text.tertiary'),
  },
  subtitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleDisabled: {
    color: getColor('text.tertiary'),
  },
  formatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: getSpacing('lg'),
    gap: getSpacing('sm'),
  },
  formatBadge: {
    backgroundColor: getColor('primary.100'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
  },
  formatText: {
    ...getTypography('caption'),
    color: getColor('primary.700'),
    fontWeight: '600',
  },
  browseButton: {
    minWidth: 120,
    borderColor: getColor('primary.500'),
  },
  browseButtonText: {
    color: getColor('primary.500'),
  },
});
