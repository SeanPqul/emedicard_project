import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.lg),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(theme.spacing.md),
    lineHeight: moderateScale(20),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86AB10',
    padding: scale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.md),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#2E86AB',
    marginLeft: scale(theme.spacing.xs),
  },
  inputGroup: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(theme.spacing.xs),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: theme.borderRadius.md,
    borderWidth: moderateScale(1),
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(theme.spacing.md),
    minHeight: verticalScale(50),
  },
  inputContainerError: {
    borderColor: theme.colors.semantic.error,
  },
  inputIcon: {
    marginRight: scale(theme.spacing.sm),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#111827',
    paddingVertical: verticalScale(theme.spacing.sm),
  },
  errorText: {
    fontSize: moderateScale(12),
    color: theme.colors.semantic.error,
    marginTop: verticalScale(theme.spacing.xs),
    marginLeft: scale(2),
  },
  civilStatusContainer: {
    flexDirection: 'row',
    paddingVertical: verticalScale(theme.spacing.xs),
  },
  civilStatusOption: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.full,
    borderWidth: moderateScale(1),
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: scale(theme.spacing.sm),
  },
  civilStatusOptionSelected: {
    borderColor: '#2E86AB',
    backgroundColor: '#2E86AB',
  },
  civilStatusText: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  civilStatusTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default styles;
