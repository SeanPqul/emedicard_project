import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(24),
    backgroundColor: theme.colors.background.primary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(32),
    lineHeight: moderateScale(20),
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(16),
    height: verticalScale(56),
  },
  inputIcon: {
    marginRight: scale(12),
  },
  inputWithIcon: {
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
  },
  eyeIcon: {
    padding: moderateScale(8),
  },
  errorContainer: {
    minHeight: verticalScale(24),
    marginBottom: verticalScale(8),
  },
  errorText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  passwordRequirements: {
    marginBottom: verticalScale(24),
  },
  primaryButton: {
    backgroundColor: theme.colors.blue[500],
    borderRadius: theme.borderRadius.md,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.inverse,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
  },
  backButtonText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    marginLeft: scale(8),
  },
});
