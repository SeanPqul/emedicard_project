import { StyleSheet } from 'react-native';
import { FONT_SIZES, FONT_WEIGHTS, moderateScale, verticalScale } from '@shared/utils/responsive';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from '@shared/utils/responsive';
import { getColor, getBorderRadius, getShadow } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('4%'),
    paddingTop: hp('4%'),
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  iconCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: getColor('semantic.error'),
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

  changePasswordButton: {
    backgroundColor: getColor('semanticUI.primaryButton'),
    borderRadius: getBorderRadius('lg'),
    height: hp('6.5%'), 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    ...getShadow('medium'),
  },
  changePasswordButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  changePasswordButtonText: {
    color: getColor('text.inverse'),
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
  },

  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: getColor('border.medium'),
    borderWidth: 1,
    borderRadius: getBorderRadius('lg'),
    height: hp('6.5%'), 
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: getColor('text.secondary'),
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
