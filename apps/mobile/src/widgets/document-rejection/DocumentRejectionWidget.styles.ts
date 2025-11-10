import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, moderateScale, verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(16),
    marginVertical: verticalScale(8),
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.status.error + '20',
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  headerIcon: {
    marginRight: scale(12),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700' as const,
    color: theme.colors.status.error,
    marginBottom: verticalScale(4),
  },
  documentName: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  attemptBadge: {
    backgroundColor: theme.colors.status.error + '10',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.status.error + '20',
  },
  attemptText: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: theme.colors.status.error,
  },
  
  // Reason Section
  reasonSection: {
    marginBottom: verticalScale(16),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  reasonLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(22),
  },
  
  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.status.warning + '10',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: theme.borderRadius.md,
    marginTop: verticalScale(8),
  },
  categoryIcon: {
    marginRight: scale(6),
  },
  categoryText: {
    fontSize: moderateScale(13),
    fontWeight: '500' as const,
    color: theme.colors.status.warning,
  },
  
  // Issues Section
  issuesSection: {
    marginBottom: verticalScale(16),
  },
  issuesTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(10),
  },
  issuesList: {
    paddingLeft: scale(8),
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  issueIcon: {
    marginRight: scale(10),
    marginTop: verticalScale(2),
  },
  issueText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(20),
  },
  
  // Action Section
  actionSection: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(16),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: theme.borderRadius.md,
    gap: scale(8),
  },
  primaryButton: {
    backgroundColor: theme.colors.brand.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  buttonIcon: {
    marginRight: scale(4),
  },
  primaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.inverse,
  },
  secondaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  // Replacement Status Section
  replacementStatus: {
    backgroundColor: theme.colors.status.success + '08',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(14),
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderColor: theme.colors.status.success + '20',
  },
  replacementStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  replacementStatusTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600' as const,
    color: theme.colors.status.success,
    marginLeft: scale(8),
  },
  replacementStatusText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginLeft: scale(28), // Align with title (icon width + margin)
  },
  
  // Loading State
  loadingContainer: {
    padding: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Date Section
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  dateIcon: {
    marginRight: scale(6),
  },
  dateText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
  },
  
  // Phase 4 Migration: Doctor Section (for medical referrals)
  doctorSection: {
    backgroundColor: '#EFF6FF', // Light blue background
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(14),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#3B82F6' + '20',
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  doctorTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600' as const,
    color: '#3B82F6',
    marginLeft: scale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(6),
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(4),
  },
  clinicAddress: {
    flex: 1,
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginLeft: scale(6),
    lineHeight: moderateScale(18),
  },
  
  // Manual Review Section
  manualReviewSection: {
    backgroundColor: '#FEE2E2', // Light red background
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(16),
    marginTop: verticalScale(16),
    borderWidth: 1,
    borderColor: '#DC2626' + '30',
  },
  manualReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  manualReviewTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700' as const,
    color: '#DC2626',
    marginLeft: scale(10),
    flex: 1,
  },
  manualReviewText: {
    fontSize: moderateScale(14),
    color: '#7F1D1D',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  venueInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(14),
    gap: verticalScale(14),
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  venueTextContainer: {
    flex: 1,
    marginLeft: scale(12),
  },
  venueLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600' as const,
    color: '#7F1D1D',
    marginBottom: verticalScale(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  venueText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    lineHeight: moderateScale(20),
  },
});
