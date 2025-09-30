import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: verticalScale(theme.spacing.lg),
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
  optionsContainer: {
    gap: verticalScale(theme.spacing.md),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: scale(theme.spacing.md),
    borderWidth: moderateScale(2),
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: theme.colors.brand.secondary,
    backgroundColor: theme.colors.background.tertiary,
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: theme.colors.brand.secondary,
  },
  optionContent: {
    flex: 1,
    marginLeft: scale(theme.spacing.md),
    marginRight: scale(theme.spacing.sm),
  },
  optionTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(2),
  },
  optionTitleSelected: {
    color: theme.colors.brand.secondary,
  },
  optionDescription: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },
  radioButton: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(2),
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.brand.secondary,
  },
  radioButtonInner: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: theme.colors.brand.secondary,
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
