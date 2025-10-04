import React from 'react';
import { Image as RNImage, ImageProps as RNImageProps } from 'react-native';

// Try to import expo-image, but fallback to React Native Image if there's an issue
let ExpoImage: any;
let useExpoImage = false;

try {
  const expoImageModule = require('expo-image');
  if (expoImageModule && expoImageModule.Image) {
    ExpoImage = expoImageModule.Image;
    useExpoImage = true;
  }
} catch (error) {
  console.log('expo-image not available, using React Native Image');
}

type SafeImageProps = RNImageProps & {
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  transition?: number;
  placeholder?: string | number;
  placeholderContentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

/**
 * SafeImage component that uses expo-image when available, 
 * but falls back to React Native Image if there are issues
 */
export function SafeImage(props: SafeImageProps) {
  if (useExpoImage && ExpoImage) {
    return <ExpoImage {...props} />;
  }

  // Fallback to React Native Image
  const { contentFit, transition, placeholder, placeholderContentFit, ...rnImageProps } = props;
  
  // Map expo-image contentFit to React Native resizeMode
  const resizeMode = contentFit === 'cover' ? 'cover' : 
                     contentFit === 'contain' ? 'contain' :
                     contentFit === 'fill' ? 'stretch' :
                     contentFit === 'scale-down' ? 'contain' : 
                     'cover';

  return <RNImage {...rnImageProps} resizeMode={resizeMode} />;
}

// Re-export as Image for easier migration
export { SafeImage as Image };
