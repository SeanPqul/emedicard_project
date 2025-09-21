// SignUpScreen styles
import { FONT_SIZES, FONT_WEIGHTS } from '@/src/utils/responsive';
import { moderateScale, verticalScale } from '@/src/utils/responsive';
import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '@/src/utils/responsive';
import { getColor, getBorderRadius, getShadow } from '@/src/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('4%'),
    paddingTop: hp('4%'),
  },

  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp('3%'),
  },
  orgLogo: {
    alignItems: 'center',
  },
  logoImage: {
    width: moderateScale(100),       
    height: moderateScale(100),
    marginBottom: verticalScale(8),
  },
  orgText: {
    fontSize: FONT_SIZES.caption,  
    color: getColor('text.secondary'),
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
  },

  title: {
    fontSize: FONT_SIZES.headline,
    fontWeight: 'bold',
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(20),
  },

  formContainer: {
    width: wp('90%'),
    alignSelf: 'center',
  },

  inputIcon: {
    marginRight: moderateScale(12),
  },

  inputWithIcon: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: getColor('text.primary'),
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: getColor('background.tertiary'),
    borderColor: getColor('border.light'),
    borderRadius: getBorderRadius('lg'),
    paddingHorizontal: moderateScale(13),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(13),
    fontSize: FONT_SIZES.body,
    ...getShadow('small'),
  },

  eyeIcon: {
    position: 'absolute',
    right: moderateScale(13),
  },

  errorContainer: {
    minHeight: verticalScale(16),
    marginTop: verticalScale(-8),
  },
  errorText: {
    color: getColor('semanticUI.errorText'),
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
  },

  passwordRequirements: {
    marginBottom: verticalScale(16),
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.micro,
    color: getColor('text.secondary'),
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: verticalScale(4),
  },
  requirementItem: {
    fontSize: FONT_SIZES.micro,
    color: getColor('text.tertiary'),
    lineHeight: moderateScale(16),
  },
  requirementMet: {
    color: getColor('accent.primaryGreen'),
    fontWeight: FONT_WEIGHTS.medium,
  },

  signUpButton: {
    backgroundColor: getColor('semanticUI.primaryButton'),
    borderRadius: getBorderRadius('lg'),
    height: hp('6.5%'), 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    ...getShadow('medium'),
  },
  signUpButtonText: {
    color: getColor('text.inverse'),
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
  },

  googleButton: {
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  googleIcon: {
    width: wp('50%'),
    height: hp('6%'),
  },

  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    color: getColor('text.secondary'),
    fontSize: FONT_SIZES.caption,
  },
  signInLinkText: {
    color: getColor('accent.primaryGreen'),
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
  },

  buttonDisabled: {
    backgroundColor: getColor('semanticUI.disabled'),
  },

  //dash line
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(17),
    width: '100%'
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: getColor('border.light'),
    marginTop: verticalScale(4)
  },

  orText: {
    marginHorizontal: 10,
    color: getColor('text.tertiary'),
    fontSize: FONT_SIZES.caption,
  },
});
