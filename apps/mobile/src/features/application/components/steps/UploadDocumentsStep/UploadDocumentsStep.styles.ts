import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: verticalScale(theme.spacing.lg),
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
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
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.sm),
    borderWidth: moderateScale(1.5),
    borderColor: theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(4),
    elevation: 1,
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
    fontSize: moderateScale(theme.typography.body.fontSize),
    fontWeight: '600',
    color: theme.colors.text.primary,
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
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
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
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
    marginTop: verticalScale(theme.spacing.sm),
  },
  uploadButtonText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    color: theme.colors.brand.secondary,
    fontWeight: '500',
    marginLeft: scale(theme.spacing.xs),
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
});

export default styles;
