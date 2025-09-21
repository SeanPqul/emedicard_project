import { Dimensions } from 'react-native';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for scaling (iPhone 11 Pro Max)
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 896;

// Scale functions
export const horizontalScale = (size: number): number => {
  return (screenWidth / guidelineBaseWidth) * size;
};

export const verticalScale = (size: number): number => {
  return (screenHeight / guidelineBaseHeight) * size;
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (horizontalScale(size) - size) * factor;
};

// Convenience functions for responsive text
export const responsiveFontSize = (size: number): number => {
  return moderateScale(size, 0.3);
};

// Responsive width and height percentages
export const widthPercentageToDP = (widthPercent: string | number): number => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return (screenWidth * elemWidth) / 100;
};

export const heightPercentageToDP = (heightPercent: string | number): number => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return (screenHeight * elemHeight) / 100;
};

// Short aliases
export const wp = widthPercentageToDP;
export const hp = heightPercentageToDP;
