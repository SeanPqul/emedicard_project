import { StyleSheet } from 'react-native';
import { getColor, getSpacing, getBorderRadius, getTypography } from '../theme';

// Common style patterns extracted from inline styles across the app
export const commonPatterns = StyleSheet.create({
  // Layout patterns
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCenterSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHorizontal: {
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  
  // Spacing patterns
  spacerMd: {
    height: getSpacing('md'),
  },
  spacerLg: {
    height: getSpacing('lg'),
  },
  spacerSm: {
    height: getSpacing('sm'),
  },
  
  // Common margin patterns
  marginBottomMd: {
    marginBottom: getSpacing('md'),
  },
  marginBottomLg: {
    marginBottom: getSpacing('lg'),
  },
  marginBottomSm: {
    marginBottom: getSpacing('sm'),
  },
  
  // Form patterns
  requiredAsterisk: {
    color: getColor('semantic.error'),
  },
  
  // Badge patterns
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: getColor('semantic.success') + '20', // 20% opacity
    paddingHorizontal: getSpacing('xs'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('xs'),
  },
  
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Category card patterns
  categoryCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
  },
  
  // Color indicator patterns
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('sm'),
  },
  
  // Icon container patterns
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Document item patterns
  documentItem: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Summary item patterns
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  
  // Payment option patterns
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('background.secondary'),
  },
  
  // Action button patterns
  primaryButton: {
    backgroundColor: getColor('primary.500'),
    borderRadius: getBorderRadius('md'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: getColor('primary.500'),
    borderRadius: getBorderRadius('md'),
    paddingVertical: getSpacing('sm'),
    alignItems: 'center',
  },
  
  // State patterns
  loadingState: {
    alignItems: 'center',
    paddingVertical: getSpacing('xxxl'),
    paddingHorizontal: getSpacing('xl'),
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing('xxxl'),
    paddingHorizontal: getSpacing('xl'),
  },
});

// Text patterns
export const textPatterns = StyleSheet.create({
  requiredText: {
    ...getTypography('caption'),
    color: getColor('semantic.success'),
    fontWeight: '500',
  },
  
  orientationText: {
    ...getTypography('caption'),
    color: getColor('primary.500'),
    marginLeft: getSpacing('xs'),
  },
  
  summaryText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('xs'),
  },
  
  primaryButtonText: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
  },
  
  secondaryButtonText: {
    ...getTypography('button'),
    color: getColor('primary.500'),
  },
  
  loadingTitle: {
    ...getTypography('h3'),
    color: getColor('primary.500'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  
  loadingDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
  
  emptyTitle: {
    ...getTypography('h3'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  
  emptyDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
});