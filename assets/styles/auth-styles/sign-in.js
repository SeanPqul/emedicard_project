import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
    paddingBottom: hp('2%'),
  },
  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('5%'),
    marginTop: hp('7%'),
  },
  orgLogo: {
    alignItems: 'center',
  },
  healthLogo: {
    width: wp('25%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  cityLogo: {
    width: wp('25%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  healthLogoText: {
    fontSize: wp('8%'),
  },
  cityLogoText: {
    fontSize: wp('8%'),
  },
  logoImage: {
    width: wp('25%'),
    height: wp('25%'),
  },
  orgText: {
    fontSize: wp('2.8%'),
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: hp('1.5%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: wp('5%'),
    marginBottom: hp('5%'),
  },
  formContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    fontSize: wp('4%'),
    marginBottom: hp('2%'),
    color: '#1F2937',
    minHeight: hp('6%'),
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: hp('2%'),
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    paddingRight: wp('12%'),
    fontSize: wp('4%'),
    color: '#1F2937',
    minHeight: hp('6%'),
  },
  eyeIcon: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('2%'),
    padding: wp('1%'),
  },
  // Add this for the icon size
  eyeIconSize: wp('6%'),
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: hp('2.5%'),
  },
  errorForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp('2.5%'),
    minHeight: hp('2.5%'),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#EF4444',
    fontSize: wp('3.2%'),
    fontWeight: '500',
  },
  forgotPasswordLink: {
    // Link styling handled by Link component
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#10B981',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    marginBottom: hp('3%'),
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: hp('6%'),
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signInButtonText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: wp('3.5%'),
    marginBottom: hp('2%'),
  },
  googleButton: {
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginBottom: hp('0%'),
  },
  // Add these for GoogleSignInButton dimensions
  googleButtonWidth: wp('50%'),
  googleButtonHeight: hp('6%'),
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleText: {
    color: '#3C4043',
    fontSize: wp('4%'),
    fontWeight: '500',
    marginLeft: wp('3%'),
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp('2.5%'),
  },
  signUpText: {
    color: '#6B7280',
    fontSize: wp('3.5%'),
  },
  signUpLinkText: {
    color: '#10B981',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
})