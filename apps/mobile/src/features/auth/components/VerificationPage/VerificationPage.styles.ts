import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Email Icon Container
  iconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  emailIcon: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  
  // Title and Subtitle
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(18),
    paddingHorizontal: wp(5),
  },
  emailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.tertiary,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    marginBottom: hp(4),
  },

  // Form Container
  formContainer: {
    width: wp(90),
    alignSelf: 'center',
  },

  // OTP Input Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  otpInput: {
    width: wp(12.5), 
    height: hp(7),
    backgroundColor: COLORS.background.secondary,
    borderWidth: moderateScale(2),
    borderColor: COLORS.border.light,
    borderRadius: moderateScale(10),
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
  },
  otpInputFilled: {
    borderColor: COLORS.status.success,
    backgroundColor: '#E8F5E8',
  },
  otpInputError: {
    borderColor: COLORS.status.error,
    backgroundColor: '#FEF2F2',
  },

  // Error Container
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp(2.2),
    marginBottom: verticalScale(6),
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Verify Button
  verifyButton: {
    backgroundColor: COLORS.status.success,
    borderRadius: moderateScale(10),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    shadowColor: COLORS.status.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  verifyButtonText: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },

  // Resend Section
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginRight: moderateScale(4),
    textAlignVertical: 'center'
  },
  resendButton: {
    // Button area for tap
  },
  resendButtonText: {
    color: COLORS.status.success,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  resendButtonDisabled: {
    color: COLORS.text.tertiary,
  },

  // Back Button
  backContainer: {
    alignItems: 'center',
    width: wp(90),
  },
  backLink: {
    // Link styles if needed
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backText: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    marginLeft: moderateScale(8),
  },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  successContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: moderateScale(20),
    padding: wp(8),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 8,
    width: wp(90),
  },
  successIcon: {
    marginBottom: hp(3),
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: moderateScale(18),
  },
  
  // Countdown and Continue Button
  countdownContainer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  countdownText: {
    fontSize: moderateScale(14),
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.status.success,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(24),
    shadowColor: COLORS.status.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(4),
    elevation: 4,
  },
  continueButtonText: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
});
