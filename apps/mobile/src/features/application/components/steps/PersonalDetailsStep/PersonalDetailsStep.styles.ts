import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: verticalScale(theme.spacing.lg),
    paddingBottom: verticalScale(theme.spacing.xl),
  },
  title: {
    fontSize: moderateScale(theme.typography.h3.fontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  subtitle: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xl),
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
  },
  inputGroup: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  inputLabel: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    borderWidth: moderateScale(1.5),
    borderColor: theme.colors.border.light,
    paddingHorizontal: scale(theme.spacing.md),
    minHeight: verticalScale(56),
  },
  inputContainerError: {
    borderColor: theme.colors.semantic.error,
  },
  inputContainerMultiline: {
    minHeight: verticalScale(96),
    alignItems: 'flex-start',
    paddingVertical: verticalScale(theme.spacing.sm),
  },
  inputIcon: {
    marginRight: scale(theme.spacing.sm),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: verticalScale(72),
  },
  errorText: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    color: theme.colors.semantic.error,
    marginTop: verticalScale(2),
    marginLeft: scale(2),
  },
  civilStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(theme.spacing.xs),
  },
  civilStatusOption: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: moderateScale(20),
    borderWidth: moderateScale(1.5),
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  civilStatusOptionSelected: {
    borderColor: theme.colors.brand.secondary,
    backgroundColor: theme.colors.background.tertiary,
  },
  civilStatusText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },
  civilStatusTextSelected: {
    color: theme.colors.brand.secondary,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.md),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.brand.secondary,
    marginLeft: scale(theme.spacing.xs),
    lineHeight: moderateScale(18),
  },
});

export default styles;
