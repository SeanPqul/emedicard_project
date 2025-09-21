import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(24),
    backgroundColor: COLORS.background.primary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(20),
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    height: verticalScale(56),
  },
  inputIcon: {
    marginRight: horizontalScale(12),
  },
  inputWithIcon: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  eyeIcon: {
    padding: moderateScale(8),
  },
  errorContainer: {
    minHeight: verticalScale(24),
    marginBottom: verticalScale(8),
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.status.error,
    textAlign: 'center',
  },
  passwordRequirements: {
    marginBottom: verticalScale(24),
  },
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold as any,
    color: COLORS.text.inverse,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: horizontalScale(8),
  },
});
