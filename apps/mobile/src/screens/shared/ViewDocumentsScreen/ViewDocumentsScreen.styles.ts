import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(theme.spacing.xl),
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: theme.colors.background.primary,
    margin: moderateScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginVertical: verticalScale(theme.spacing.xs),
  },
  summaryValue: {
    fontSize: moderateScale(24),
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginTop: verticalScale(theme.spacing.xs),
  },
  summaryLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs / 2),
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500] + '10',
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[500],
    gap: scale(theme.spacing.sm),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(13 * 1.4),
  },

  // Warning Card
  warningCard: {
    backgroundColor: theme.colors.semantic.error + '10',
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.semantic.error,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
    gap: scale(theme.spacing.xs),
  },
  warningTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.semantic.error,
  },
  warningText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
    lineHeight: moderateScale(13 * 1.4),
  },
  warningItem: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginLeft: scale(theme.spacing.sm),
    marginTop: verticalScale(theme.spacing.xs / 2),
  },
  uploadMissingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.semantic.error,
    paddingVertical: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginTop: verticalScale(theme.spacing.md),
    gap: scale(theme.spacing.xs),
  },
  uploadMissingText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.background.primary,
  },

  // Documents Container
  documentsContainer: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.xl * 1), // Add extra bottom padding to prevent last item cutoff
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.md),
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(theme.spacing.xl * 2),
    paddingHorizontal: scale(theme.spacing.xl),
  },
  emptyStateTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginTop: verticalScale(theme.spacing.md),
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.sm),
    textAlign: 'center',
    lineHeight: moderateScale(14 * 1.5),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    borderRadius: theme.borderRadius.md,
    marginTop: verticalScale(theme.spacing.lg),
    gap: scale(theme.spacing.sm),
  },
  uploadButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.background.primary,
  },

  // Document Card
  documentCard: {
    backgroundColor: theme.colors.background.primary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.lg,
    marginBottom: verticalScale(theme.spacing.md),
    ...theme.shadows.small,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  documentIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[500] + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(theme.spacing.sm),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs / 2),
  },
  documentFileName: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs / 2),
  },
  documentDate: {
    fontSize: moderateScale(11),
    color: theme.colors.text.tertiary,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(theme.spacing.xs),
    paddingHorizontal: scale(theme.spacing.sm),
    borderRadius: theme.borderRadius.full,
    marginBottom: verticalScale(theme.spacing.sm),
    gap: scale(theme.spacing.xs),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
  },

  // Remarks
  remarksContainer: {
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  remarksLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs / 2),
  },
  remarksText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(12 * 1.5),
  },

  // View Button
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500] + '10',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500] + '30',
    gap: scale(theme.spacing.xs),
    flex: 1,
  },
  viewButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.primary[500],
  },

  // Document Actions
  documentActions: {
    flexDirection: 'row',
    gap: scale(theme.spacing.sm),
    marginTop: verticalScale(theme.spacing.xs),
  },

  // Replace Button
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.semantic.error + '10',
    paddingVertical: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.semantic.error + '30',
    gap: scale(theme.spacing.xs),
    flex: 1,
  },
  replaceButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.semantic.error,
  },


  // Rejection Banner (inside document card)
  rejectionBanner: {
    backgroundColor: theme.colors.semantic.error + '10',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.md),
    borderWidth: 1,
    borderColor: theme.colors.semantic.error + '20',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(theme.spacing.xs),
    marginBottom: verticalScale(theme.spacing.sm),
  },
  rejectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.semantic.error,
  },
  rejectionText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
  },
  attemptText: {
    fontSize: moderateScale(12),
    color: theme.colors.semantic.error,
    fontWeight: '500' as const,
    marginTop: verticalScale(theme.spacing.xs),
  },


  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    flex: 1,
    marginHorizontal: scale(theme.spacing.md),
    textAlign: 'center',
  },
  documentViewerContent: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // PDF Container
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(theme.spacing.xl),
  },
  pdfText: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginTop: verticalScale(theme.spacing.md),
  },
  pdfFileName: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs),
    textAlign: 'center',
  },
  openExternalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: verticalScale(theme.spacing.md),
    paddingHorizontal: scale(theme.spacing.lg),
    borderRadius: theme.borderRadius.md,
    marginTop: verticalScale(theme.spacing.xl),
    gap: scale(theme.spacing.sm),
  },
  openExternalButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.background.primary,
  },
  
  // Image Viewer
  imageScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(theme.spacing.md),
  },
  documentImage: {
    width: '100%',
    height: '100%',
    minHeight: verticalScale(400),
  },
});

