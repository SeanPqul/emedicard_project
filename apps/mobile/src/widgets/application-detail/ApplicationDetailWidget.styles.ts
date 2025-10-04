import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(theme.spacing.xl * 1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.md),
  },

  // Header
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
  backButton: {
    padding: moderateScale(theme.spacing.xs),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: moderateScale(24),
  },

  // Status Card
  statusCard: {
    backgroundColor: theme.colors.background.primary,
    margin: moderateScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(theme.spacing.md),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.xs),
    paddingHorizontal: scale(theme.spacing.sm),
    borderRadius: theme.borderRadius.full,
    gap: scale(theme.spacing.xs),
  },
  statusInfo: {
    marginTop: verticalScale(theme.spacing.sm),
  },
  statusLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  statusValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  statusText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
  },
  applicationId: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.sm),
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    gap: scale(theme.spacing.xs),
  },
  deadlineText: {
    fontSize: moderateScale(13),
    fontWeight: '500' as const,
  },
  urgencyBanner: {
    padding: moderateScale(theme.spacing.sm),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.md),
  },
  urgencyText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  remarksContainer: {
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
  },
  remarksLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  remarksText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(14 * 1.5),
  },

  // Details Card
  detailsCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light + '30',
  },
  detailLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
    gap: scale(theme.spacing.xs),
  },
  categoryIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: theme.borderRadius.full,
  },
  orientationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.sm),
    backgroundColor: theme.colors.accent.warningOrange + '20',
    borderRadius: theme.borderRadius.md,
    gap: scale(theme.spacing.xs),
  },
  orientationText: {
    fontSize: moderateScale(12),
    color: theme.colors.accent.warningOrange,
    flex: 1,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light + '30',
  },
  infoLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
  jobCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  jobCategoryDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: theme.borderRadius.full,
    marginRight: scale(theme.spacing.xs),
  },

  // Payment Card
  paymentCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  paymentDescription: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  feeBreakdown: {
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.lg),
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(theme.spacing.xs),
  },
  feeLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  feeValue: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginTop: verticalScale(theme.spacing.xs),
    paddingTop: verticalScale(theme.spacing.sm),
  },
  totalLabel: {
    fontSize: moderateScale(16),
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  totalValue: {
    fontSize: moderateScale(16),
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
  },
  paymentMethodsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(theme.spacing.sm),
  },
  paymentMethodCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodName: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginTop: verticalScale(theme.spacing.xs),
  },
  paymentMethodDesc: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(theme.spacing.xs),
  },
  processingContainer: {
    marginTop: verticalScale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    alignItems: 'center',
  },
  processingText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  
  // Payment History Card
  paymentHistoryCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  
  // Remarks Card
  remarksCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },

  // Documents Card
  documentsCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.xl),
    padding: moderateScale(theme.spacing.lg),
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  documentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  rejectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.semantic.error + '20',
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
    gap: scale(theme.spacing.xs),
  },
  rejectionBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: theme.colors.semantic.error,
  },
  documentsStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.md),
    gap: scale(theme.spacing.sm),
  },
  documentsStatusText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(14 * 1.5),
  },
  viewDocumentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary[500] + '10',
    padding: moderateScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500] + '30',
  },
  viewDocumentsText: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.primary[500],
    marginLeft: scale(theme.spacing.sm),
  },

  // Action Buttons
  actionButtons: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.xl),
    gap: verticalScale(theme.spacing.sm),
  },
});
