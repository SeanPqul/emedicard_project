import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '@/src/utils/scaling-utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },

  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: verticalScale(20),
  },
  orgLogo: {
    alignItems: 'center',
  },
  logoImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    marginBottom: verticalScale(8),
  },
  orgText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    fontWeight: '600',
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
    width: '100%',
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
    marginBottom: verticalScale(12),
    color: '#1F2937',
  },

  passwordContainer: {
    position: 'relative',
    marginBottom: verticalScale(12),
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
    size : moderateScale(20),
  },

  errorForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
    minHeight: verticalScale(20),
  },
  errorContainer: {
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },

  signInButton: {
    backgroundColor: '#10B981',
    borderRadius: moderateScale(10),
    height: verticalScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signInButtonText: {
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
    width: scale(200),
    height: verticalScale(48),
  },

  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: moderateScale(12),
  },
  signUpLinkText: {
    color: '#10B981',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
});
