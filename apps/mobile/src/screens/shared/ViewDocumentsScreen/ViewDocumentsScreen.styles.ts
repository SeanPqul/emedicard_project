import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
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

  // Inline Header Section
  inlineHeaderSection: {
    backgroundColor: theme.colors.background.primary,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(-8), // Align icon to screen edge
    marginRight: scale(8),
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: '500' as const,
    color: theme.colors.text.secondary,
    paddingLeft: scale(48), // Align with title (back button width + margin)
  },
  headerSpacer: {
    width: moderateScale(40), // Same as back button for visual balance
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

  // Info Card - Updated to match profile card style
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: scale(theme.spacing.sm),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(13 * 1.4),
  },

  // Warning Card - Updated to match profile card style
  warningCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.semantic.error + '30',
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
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(theme.spacing.xl * 1), // Add extra bottom padding to prevent last item cutoff
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(theme.spacing.xs),
    paddingVertical: verticalScale(theme.spacing.xs),
    paddingHorizontal: scale(theme.spacing.sm),
    backgroundColor: theme.colors.primary[500] + '10',
    borderRadius: theme.borderRadius.md,
  },
  historyButtonText: {
    color: theme.colors.primary[500],
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
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

  // Document Card - Updated to match profile card style
  documentCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  documentIconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: moderateScale(15),
    color: theme.colors.text.primary,
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
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(8),
    borderRadius: theme.borderRadius.full,
    marginTop: verticalScale(4),
    gap: scale(4),
  },
  statusText: {
    fontSize: moderateScale(11),
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
  
  // Document sub-item styles
  documentSubItem: {
    borderTopWidth: moderateScale(1),
    borderTopColor: '#F0F0F0',
  },
  documentSubItemText: {
    fontSize: moderateScale(15),
    color: theme.colors.semantic.error,
  },
  rejectionReason: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
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
    paddingTop: verticalScale(theme.spacing.xl + theme.spacing.md), // Extra top padding for status bar
    paddingBottom: verticalScale(theme.spacing.md),
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
    color: theme.colors.text.tertiary,
    marginTop: moderateScale(8),
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(16),
  },
  downloadButtonText: {
    color: theme.colors.background.primary,
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    marginLeft: moderateScale(8),
  },
  openExternalButton: {
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
  openExternalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.background.primary,
  },
  securityNote: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
    textAlign: 'center',
    fontStyle: 'italic' as const,
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
  
  // PDF Viewer
  pdfViewer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

