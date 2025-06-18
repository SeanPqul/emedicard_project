import { StyleSheet} from 'react-native'


export const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  
  // Email Icon Container
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emailIcon: {
    width: 90,
    height: 90,
  },
  
  // Title and Subtitle
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emailText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },

  // Form Container
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },

  // OTP Input Container
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
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
    minHeight: 20,
    marginBottom : 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Verify Button
  verifyButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },

  // Resend Section
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#9CA3AF',
  },

  // Back Button
  backContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backLink: {
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Success Screen
  successContainer: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
})