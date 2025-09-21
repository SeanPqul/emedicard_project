import { FONT_SIZES, FONT_WEIGHTS } from '@shared/utils/responsive';
import { moderateScale, verticalScale } from "@shared/utils/responsive";
import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "@shared/utils/responsive";
import { theme, getColor, getSpacing, getTypography, getBorderRadius, getShadow } from "@shared/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    justifyContent: "center",
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("5%"),
  },

  orgLogosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: hp("4%"),
    marginBottom: hp("5%"),
  },
  orgLogo: {
    alignItems: "center",
  },
  logoImage: {
    width: moderateScale(100),
    height: moderateScale(100),
    marginBottom: verticalScale(8.8),
  },
  orgText: {
    fontSize: FONT_SIZES.caption,
    color: getColor('text.secondary'),
    fontWeight: "600",
    textAlign: "center",
  },

  title: {
    fontSize: FONT_SIZES.headline,
    fontWeight: "bold",
    color: getColor('text.primary'),
    textAlign: "center",
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: getColor('text.secondary'),
    textAlign: "center",
    lineHeight: moderateScale(19.5),
    marginBottom: verticalScale(22),
  },

  formContainer: {
    width: wp("90%"),
    alignSelf: "center",
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
    position: "absolute",
    right: moderateScale(13),
    //top: verticalScale(18),
  },

  errorForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(13),
    minHeight: verticalScale(22),
  },
  errorContainer: {
    flex: 1,
  },
  errorText: {
    color: getColor('semanticUI.errorText'),
    fontSize: FONT_SIZES.caption,
    fontWeight: "500",
  },
  forgotPasswordText: {
    color: getColor('accent.primaryGreen'),
    fontSize: FONT_SIZES.action,
    fontWeight: FONT_WEIGHTS.medium,
  },

  signInButton: {
    backgroundColor: getColor('semanticUI.primaryButton'),
    borderRadius: getBorderRadius('lg'),
    height: hp("6.5%"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("3%"),
    ...getShadow('medium'),
  },
  buttonDisabled: {
    backgroundColor: getColor('semanticUI.disabled'),
  },
  signInButtonText: {
    color: getColor('text.inverse'),
    fontSize: FONT_SIZES.body,
    fontWeight: "bold",
  },

  googleButton: {
    alignItems: "center",
    marginBottom: verticalScale(13.2),
  },

  googleIcon: {
    width: wp("50%"),
    height: hp("6%"),
  },

  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signUpText: {
    color: getColor('text.secondary'),
    fontSize: FONT_SIZES.caption,
  },
  signUpLinkText: {
    color: getColor('accent.primaryGreen'),
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
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
