import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container and Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.semibold,
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
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.md),
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: hp(8), // Space for tab bar
    gap: horizontalScale(SPACING.md),
  },
  previousButton: {
    flex: 1,
    paddingVertical: verticalScale(SPACING.md),
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  previousButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  nextButton: {
    flex: 1,
    paddingVertical: verticalScale(SPACING.md),
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.inverse,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: verticalScale(SPACING.md),
  },
});
