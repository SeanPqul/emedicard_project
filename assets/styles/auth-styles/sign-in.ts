import { FONT_SIZES, FONT_WEIGHTS } from "@/constant/fontSizes";
import { moderateScale, verticalScale } from "@/src/utils/scaling-utils";
import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },

  title: {
    fontSize: FONT_SIZES.headline,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: "#6B7280",
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
    color: "#1F2937",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(13),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(13),
    fontSize: FONT_SIZES.body,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
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
    color: "#EF4444",
    fontSize: FONT_SIZES.caption,
    fontWeight: "500",
  },
  forgotPasswordText: {
    color: "#10B981",
    fontSize: FONT_SIZES.action,
    fontWeight: FONT_WEIGHTS.medium,
  },

  signInButton: {
    backgroundColor: "#10B981",
    borderRadius: moderateScale(11),
    height: hp("6.5%"),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp("3%"),
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8.5),
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  signInButtonText: {
    color: "white",
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
    color: "#6B7280",
    fontSize: FONT_SIZES.caption,
  },
  signUpLinkText: {
    color: "#10B981",
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
    backgroundColor: "#E5E7EB",
    marginTop: verticalScale(4)
  },

  orText: {
    marginHorizontal: 10,
    //textAlign: "center",
    color: "#9CA3AF",
    fontSize: FONT_SIZES.caption,
  },
});
