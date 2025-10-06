import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: verticalScale(theme.spacing.lg),
    paddingHorizontal: scale(theme.spacing.lg),
    paddingBottom: verticalScale(theme.spacing.xl + 20), // Extra padding for safe area
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: scale(theme.spacing.xs),
    marginRight: scale(-theme.spacing.xs),
  },
  documentInfo: {
    backgroundColor: theme.colors.background.secondary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.lg),
  },
  documentLabel: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  documentName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  instructionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.lg),
    lineHeight: moderateScale(22),
  },
  uploadSection: {
    marginBottom: verticalScale(theme.spacing.xl),
  },
  uploadButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: verticalScale(theme.spacing.xl),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  uploadButtonActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primary + '10',
  },
  uploadIcon: {
    marginBottom: verticalScale(theme.spacing.sm),
  },
  uploadButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.brand.secondary,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.status.success + '10',
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginTop: verticalScale(theme.spacing.md),
  },
  selectedFileText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: scale(theme.spacing.sm),
  },
  removeButton: {
    padding: scale(theme.spacing.xs),
  },
  footerButtons: {
    flexDirection: 'row',
    gap: scale(theme.spacing.md),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  cancelButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(theme.spacing.sm),
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.ui.disabled,
  },
  submitButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.inverse,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.xl),
  },
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    marginTop: verticalScale(theme.spacing.md),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.brand.primary,
    borderRadius: theme.borderRadius.full,
  },
});
