import { moderateScale, verticalScale } from '@/src/utils/scaling-utils';
import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('4%'),
    paddingTop: hp('3%'),
  },

  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp('3%'),
  },
  orgLogo: {
    alignItems: 'center',
  },
  healthLogo: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: '#10B981',
    marginBottom: verticalScale(8),
  },
  cityLogo: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: '#F59E0B',
    marginBottom: verticalScale(8),
  },
  logoImage: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  orgText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },

  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(20),
  },

  formContainer: {
    width: wp('90%'),
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#1F2937',
    marginBottom: verticalScale(12),
  },

  passwordContainer: {
    position: 'relative',
    marginBottom: verticalScale(4),
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    paddingRight: moderateScale(40),
    fontSize: moderateScale(16),
    color: '#1F2937',
  },
  eyeIcon: {
    position: 'absolute',
    right: moderateScale(12),
    top: verticalScale(12),
    size: moderateScale(20),
    padding: moderateScale(4),
  },

  errorContainer: {
    minHeight: verticalScale(16),
    marginBottom: verticalScale(-2),
  },
  errorText: {
    color: '#EF4444',
    fontSize: moderateScale(13),
    fontWeight: '500',
  },

  passwordRequirements: {
    marginBottom: verticalScale(16),
  },
  requirementsTitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  requirementItem: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    lineHeight: moderateScale(16),
  },

  signUpButton: {
    backgroundColor: '#10B981',
    borderRadius: moderateScale(10),
    height: hp('6.5%'), // Match sign in button height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },

  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  googleButton: {
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  googleIcon: {
    width: wp('50%'),
    height: hp('6.5%'),
  },

  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    color: '#6B7280',
    fontSize: moderateScale(13),
  },
  signInLinkText: {
    color: '#10B981',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },

  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
