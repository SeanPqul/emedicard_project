// VerificationScreen styles
import { FONT_SIZES, FONT_WEIGHTS } from '@/src/utils/responsive';
import { moderateScale, verticalScale } from '@/src/utils/responsive';
import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '@/src/utils/responsive';
import { getColor, getBorderRadius, getShadow, getSpacing } from '@/src/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('5%'),
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
    marginBottom: hp('3%'),
  },
  emailIcon: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  
  // Title and Subtitle
  title: {
    fontSize: FONT_SIZES.headline,
    fontWeight: 'bold',
    color: getColor('text.primary'),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.action,
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(18),
    paddingHorizontal: wp('5%'),
  },
  emailText: {
    fontSize: FONT_SIZES.action,
    color: getColor('text.tertiary'),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },

  // Form Container
  formContainer: {
    width: wp('90%'),
    alignSelf: 'center',
  },

  // OTP Input Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(4),
  },
  otpInput: {
    width: wp('12.5%'), 
    height: hp('7%'),
    backgroundColor: getColor('background.tertiary'),
    borderWidth: moderateScale(2),
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('lg'),
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: getColor('text.primary'),
  },
  otpInputFilled: {
    borderColor: getColor('accent.primaryGreen'),
    backgroundColor: '#E8F5E8',
  },
  otpInputError: {
    borderColor: getColor('semanticUI.errorText'),
    backgroundColor: '#FEF2F2',
  },

  // Error Container
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: hp('2.2%'),
    marginBottom: verticalScale(6),
  },
  errorText: {
    color: getColor('semanticUI.errorText'),
    fontSize: FONT_SIZES.caption,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Verify Button
  verifyButton: {
    backgroundColor: getColor('semanticUI.primaryButton'),
    borderRadius: getBorderRadius('lg'),
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    ...getShadow('medium'),
  },
  verifyButtonText: {
    color: getColor('text.inverse'),
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: getColor('semanticUI.disabled'),
  },

  // Resend Section
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.caption,
    color: getColor('text.secondary'),
    marginRight: moderateScale(4),
    textAlignVertical: 'center'
  },
  resendButton: {
  },
  resendButtonText: {
    color: getColor('accent.primaryGreen'),
    fontSize: FONT_SIZES.caption,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  resendButtonDisabled: {
    color: getColor('text.tertiary'),
  },

  // Back Button
  backContainer: {
    alignItems: 'center',
    width: wp('90%'),
  },
  backLink: {
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backText: {
    color: getColor('text.secondary'),
    fontSize: FONT_SIZES.caption,
    marginLeft: moderateScale(8),
  },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
  },
  successContent: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('xl'),
    alignItems: 'center',
    ...getShadow('large'),
    width: wp('90%'),
  },
  successIcon: {
    marginBottom: hp('3%'),
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: getColor('text.primary'),
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: moderateScale(18),
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(12),
    color: getColor('accent.primaryGreen'),
    fontWeight: '500',
  },
  
  // Countdown and Continue Button
  countdownContainer: {
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  countdownText: {
    fontSize: moderateScale(14),
    color: getColor('text.secondary'),
    fontWeight: '500',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: getColor('semanticUI.primaryButton'),
    borderRadius: getBorderRadius('md'),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(24),
    ...getShadow('small'),
  },
  continueButtonText: {
    color: getColor('text.inverse'),
    fontSize: FONT_SIZES.action,
    fontWeight: '600',
    textAlign: 'center',
  },
});
