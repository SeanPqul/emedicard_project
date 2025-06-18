import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    marginTop: 40,
  },
  orgLogo: {
    alignItems: 'center',
  },
  healthLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 8,
  },
  cityLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  orgText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
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
    marginBottom: 30,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  signUpButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  googleButton: {
    alignItems: 'center',
    marginBottom: 5,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8, 
    marginBottom: 0,
  },
  signInText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signInLink: {
    marginLeft: 4,
  },
  signInLinkText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  
  backButton: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  backText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },

  // error styles
  errorContainer: {
    justifyContent: 'center',
    minHeight: 20,
    marginTop: -6,
  },

  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'left',
    fontWeight: '500',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
  // password requirements
  passwordRequirements: {
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
})