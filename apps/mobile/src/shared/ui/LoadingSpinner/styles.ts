import { StyleSheet, Dimensions } from 'react-native';
import { getColor, getTypography, getSpacing } from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const getSizeValue = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return 20;
    case 'medium':
      return 30;
    case 'large':
      return 40;
    default:
      return 30;
  }
};

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing('md'),
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fullScreenContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('xl'),
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  spinnerContainer: {
    marginBottom: getSpacing('md'),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing('md'),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pulseContainer: {
    marginBottom: getSpacing('md'),
  },
  pulseCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  message: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginTop: getSpacing('md'),
  },
  progressContainer: {
    width: '100%',
    marginTop: getSpacing('md'),
  },
  progressTrack: {
    height: 4,
    backgroundColor: getColor('border.light'),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginTop: getSpacing('sm'),
  },
  skeletonItem: {
    backgroundColor: getColor('border.light'),
    borderRadius: 8,
  },
});
