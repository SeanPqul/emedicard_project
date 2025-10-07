import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(18),
    paddingHorizontal: wp(5),
  },
  emailText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.tertiary,
    fontWeight: '600' as const,
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
    backgroundColor: theme.colors.background.secondary,
    borderWidth: moderateScale(2),
    borderColor: theme.colors.border.light,
    borderRadius: moderateScale(10),
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
  },
  otpInputFilled: {
    borderColor: theme.colors.status.success,
    backgroundColor: '#E8F5E8',
  },
  otpInputError: {
    borderColor: theme.colors.status.error,
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
    color: theme.colors.status.error,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'center',
    fontWeight: '500' as const,
  },

  // Verify Button
  verifyButton: {
    backgroundColor: theme.colors.status.success,
    borderRadius: moderateScale(10),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    shadowColor: theme.colors.status.success,
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  verifyButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700' as const,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.text.tertiary,
  },

  // Resend Section
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    marginRight: moderateScale(4),
    textAlignVertical: 'center'
  },
  resendButton: {
    // Button area for tap
  },
  resendButtonText: {
    color: theme.colors.status.success,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  resendButtonDisabled: {
    color: theme.colors.text.tertiary,
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
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginLeft: moderateScale(8),
  },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  successContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(20),
    padding: wp(8),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(4),
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
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
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
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: theme.colors.status.success,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(24),
    shadowColor: theme.colors.status.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(4),
    elevation: 4,
  },
  continueButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
