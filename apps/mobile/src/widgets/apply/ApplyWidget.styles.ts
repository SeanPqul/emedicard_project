import {  StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';


export const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  headerRight: {
    width: moderateScale(40),
    alignItems: 'flex-end',
  },
  cancelButton: {
    padding: moderateScale(4),
  },

  // Navigation Buttons
  navigationButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: scale(theme.spacing.md)
  },
  previousButton: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: moderateScale(1),
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  previousButtonText: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  nextButton: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E86AB',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },
});
