import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingTop: verticalScale(SPACING.lg),
    paddingBottom: verticalScale(SPACING.xl),
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(SPACING.lg),
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(SPACING.md),
    paddingHorizontal: horizontalScale(SPACING.lg),
    marginBottom: verticalScale(SPACING.sm),
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
  },
  imagePickerOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: horizontalScale(SPACING.md),
    flex: 1,
  },
  modalCancelButton: {
    marginTop: verticalScale(SPACING.md),
    paddingVertical: verticalScale(SPACING.md),
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
