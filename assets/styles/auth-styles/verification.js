import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from '@/src/utils/scaling-utils';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(18),
    paddingHorizontal: wp('5%'),
  },
  emailText: {
    fontSize: moderateScale(14),
    color: '#9CA3AF',
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
    backgroundColor: '#F9FAFB',
    borderWidth: moderateScale(2),
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(10),
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  otpInputFilled: {
    borderColor: '#10B981',
    backgroundColor: '#E8F5E8',
  },
  otpInputError: {
    borderColor: '#EF4444',
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
    color: '#EF4444',
    fontSize: moderateScale(13),
    textAlign: 'center',
    fontWeight: '500',
  },

  // Verify Button
  verifyButton: {
    backgroundColor: '#10B981',
    borderRadius: moderateScale(10),
    height: hp('6.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  // Resend Section
  resendContainer: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  resendText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginBottom: verticalScale(8),
  },
  resendButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(16),
  },
  resendButtonText: {
    color: '#10B981',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#9CA3AF',
  },

  // Back Button
  backContainer: {
    alignItems: 'center',
    paddingTop: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: wp('90%'),
  },
  backLink: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backText: {
    color: '#6B7280',
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: moderateScale(8),
  },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
  },
  successContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: wp('8%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 8,
    width: wp('90%'),
  },
  successIcon: {
    marginBottom: hp('3%'),
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: hp('3%'),
    lineHeight: moderateScale(18),
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(12),
    color: '#10B981',
    fontWeight: '500',
  },
});