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
    marginBottom: verticalScale(theme.spacing.xl),
    lineHeight: moderateScale(20),
  },
  optionsContainer: {
    gap: verticalScale(theme.spacing.md),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    borderWidth: moderateScale(2),
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  radioOptionSelected: {
    borderColor: '#2E86AB',
    backgroundColor: '#F0F9FF',
  },
  radioCircle: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(2),
    borderColor: '#D1D5DB',
    marginRight: scale(theme.spacing.md),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2E86AB',
  },
  radioInner: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#2E86AB',
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  radioSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
  },
  errorText: {
    marginLeft: scale(theme.spacing.xs),
    color: theme.colors.semantic.error,
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
  },
});

export default styles;
