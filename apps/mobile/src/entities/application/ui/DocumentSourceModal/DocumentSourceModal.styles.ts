import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.lg),
    paddingBottom: verticalScale(theme.spacing.xl),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.sm),
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: scale(theme.spacing.md),
    flex: 1,
  },
  modalCancelButton: {
    marginTop: verticalScale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.md),
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  modalCancelText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
});
