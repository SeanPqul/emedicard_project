import { StyleSheet, Platform } from 'react-native';
import { getColor, getSpacing, getTypography } from '../../styles/theme';

export const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: getSpacing('lg'),
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: getSpacing('sm'),
    marginLeft: -getSpacing('sm'),
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('ui.white'),
    marginBottom: getSpacing('xs'),
  },
  headerSubtitle: {
    ...getTypography('bodySmall'),
    color: 'rgba(255,255,255,0.8)',
  },
  flashButton: {
    padding: getSpacing('sm'),
    marginRight: -getSpacing('sm'),
  },

  // Scanner area styles
  scannerArea: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
    width: '100%',
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // Scanner frame styles
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: getColor('primary.500'),
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: getColor('primary.500'),
    shadowColor: getColor('primary.500'),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  centerIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Controls styles
  controls: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('xl'),
    paddingBottom: Platform.OS === 'ios' ? 40 : getSpacing('xl'),
  },
  controlsContent: {
    alignItems: 'center',
  },

  // Status indicator styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: getColor('gray.400'),
    marginRight: getSpacing('sm'),
  },
  statusDotActive: {
    backgroundColor: getColor('primary.500'),
  },
  statusText: {
    ...getTypography('body'),
    color: getColor('ui.white'),
  },

  // Button styles
  scanButton: {
    minWidth: 200,
    marginBottom: getSpacing('lg'),
  },
  helpText: {
    ...getTypography('bodySmall'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
