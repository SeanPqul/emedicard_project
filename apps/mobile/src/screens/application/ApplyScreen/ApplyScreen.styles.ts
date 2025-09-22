import { Dimensions, StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  headerRight: {
    width: moderateScale(24), // Same as back button to center title
  },
  cancelButton: {
    padding: moderateScale(4),
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: hp(8), // Space for tab bar
    gap: scale(theme.spacing.md),
  },
  previousButton: {
    flex: 1,
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  previousButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
  nextButton: {
    flex: 1,
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    color: theme.colors.text.inverse,
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
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },
});
