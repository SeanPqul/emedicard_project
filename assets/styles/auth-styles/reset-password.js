import { FONT_SIZES, FONT_WEIGHTS } from '@/constant/fontSizes';
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
    paddingTop: hp('4%'),
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: FONT_SIZES.headline,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(28),
  },
  subtitle: {
    fontSize: FONT_SIZES.action,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(18),
    paddingHorizontal: wp('5%'),
  },

  emailText: {
    fontSize: FONT_SIZES.action,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },

  formContainer: {
    width: wp('90%'),
    alignSelf: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: moderateScale(12),
  },
  inputWithIcon: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: '#1F2937',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInputWithIcon: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: '#1F2937',
    marginLeft: moderateScale(12),
    marginRight: moderateScale(12),
  },
  eyeIcon: {
    padding: moderateScale(4),
  },

  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(32),
    paddingHorizontal: moderateScale(20),
  },
  codeInput: {
    width: moderateScale(45),
    height: moderateScale(45),
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(8),
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#1F2937',
    textAlign: 'center',
  },

  // Password requirements styles
  passwordRequirements: {
    marginBottom: verticalScale(16),
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.micro,
    color: '#6B7280',
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: verticalScale(4),
  },
  requirementItem: {
    fontSize: FONT_SIZES.micro,
    color: '#9CA3AF',
    lineHeight: moderateScale(16),
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: FONT_WEIGHTS.medium,
  },

  //button
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: moderateScale(12),
    height: hp('6.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: FONT_SIZES.caption,
    marginLeft: moderateScale(8),
  },

  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendText: {
    color: '#6B7280',
    fontSize: FONT_SIZES.caption,
  },
  resendLink: {
    color: '#10B981',
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: FONT_SIZES.action,
    fontWeight: FONT_WEIGHTS.medium,
  },

  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  errorContainer: {
    minHeight: verticalScale(25),
    marginBottom: verticalScale(8),
  },
  errorText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  warningText: {
    color: '#F59E0B',
    fontSize: FONT_SIZES.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
});