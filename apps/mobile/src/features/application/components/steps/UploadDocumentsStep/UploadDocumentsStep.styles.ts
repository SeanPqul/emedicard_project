import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.lg),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: verticalScale(theme.spacing.lg),
    lineHeight: moderateScale(20),
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#2E86AB10',
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.lg),
  },
  infoContent: {
    flex: 1,
    marginLeft: scale(theme.spacing.sm),
  },
  infoTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: verticalScale(2),
  },
  infoText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    lineHeight: moderateScale(16),
  },
  documentsContainer: {
    flex: 1,
  },
  documentStatus: {
    marginLeft: scale(theme.spacing.sm),
  },
  requiredAsterisk: {
    color: theme.colors.semantic.error,
  },
  progressText: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
    textAlign: 'right',
  },
  errorMessage: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    color: theme.colors.semantic.error,
    marginLeft: scale(theme.spacing.xs),
    flex: 1,
  },
  documentPreview: {
    marginTop: verticalScale(theme.spacing.sm),
  },
  documentPreviewContent: {
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: verticalScale(120),
    borderRadius: theme.borderRadius.md,
  },
  removeDocumentButton: {
    position: 'absolute',
    top: verticalScale(theme.spacing.xs),
    right: scale(theme.spacing.xs),
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
  },
  // Status-aware display styles (replaces filename display)
  statusContainer: {
    marginTop: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.xs),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  statusLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginLeft: scale(theme.spacing.xs),
  },
  fileSize: {
    fontSize: moderateScale(11),
    color: theme.colors.text.tertiary,
    marginLeft: scale(theme.spacing.lg),
    fontStyle: 'italic',
    marginTop: verticalScale(2),
  },
  progressContainer: {
    marginTop: verticalScale(theme.spacing.sm),
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(theme.spacing.xs),
  },
  progressLabel: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
  },
  progressValue: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    fontWeight: '600',
    color: theme.colors.brand.secondary,
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: theme.colors.border.light,
    borderRadius: moderateScale(5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.brand.secondary,
    borderRadius: moderateScale(5),
  },
  section: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  sectionTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    borderWidth: moderateScale(1),
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  documentCardUploaded: {
    borderColor: theme.colors.semantic.success,
    backgroundColor: theme.colors.semantic.success + '08',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.xs),
  },
  documentIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.sm),
  },
  documentIconContainerUploaded: {
    backgroundColor: theme.colors.semantic.success,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  documentTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
  },
  optionalBadge: {
    fontSize: moderateScale(11),
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.border.light,
    paddingHorizontal: scale(theme.spacing.xs),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
    marginLeft: scale(theme.spacing.xs),
  },
  documentDescription: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    lineHeight: moderateScale(18),
    marginTop: verticalScale(2),
  },
  documentFormats: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: verticalScale(2),
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.semantic.success,
    marginLeft: scale(theme.spacing.xs),
    flex: 1,
  },
  removeButton: {
    padding: scale(2),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    borderWidth: moderateScale(1),
    borderColor: '#2E86AB',
    marginTop: verticalScale(theme.spacing.sm),
  },
  uploadButtonText: {
    fontSize: moderateScale(14),
    color: '#2E86AB',
    fontWeight: '600',
    marginLeft: scale(theme.spacing.sm),
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.semantic.warning + '15',
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.md),
  },
  tipContent: {
    flex: 1,
    marginLeft: scale(theme.spacing.xs),
  },
  tipTitle: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    fontWeight: '600',
    color: theme.colors.semantic.warning,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  tipText: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    color: theme.colors.semantic.warning,
    lineHeight: moderateScale(16),
    marginBottom: verticalScale(2),
  },
  // Auto-filled Badge Styles
  autoFilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(8),
  },
  autoFilledText: {
    fontSize: moderateScale(13),
    color: '#065F46',
    fontWeight: '500',
    marginLeft: scale(6),
    flex: 1,
  },
  changeButton: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
  },
  changeLink: {
    fontSize: moderateScale(13),
    color: '#059669',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default styles;
