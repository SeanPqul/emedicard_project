import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary, // Light gray #F5F5F5
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginHorizontal: scale(theme.spacing.md),
  },
  headerSpacer: {
    width: moderateScale(40),
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Instructions Banner
  instructionsContainer: {
    marginHorizontal: scale(theme.spacing.md),
    marginTop: verticalScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.lg),
    padding: moderateScale(20),
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  instructionsTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
    letterSpacing: 0.3,
  },
  instructionsText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
  },
  
  // Category Selection Section
  categoryContainer: {
    paddingHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.md),
  },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: verticalScale(16),
  },
  categoryCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  selectedCategoryCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.background.primary,
    shadowColor: theme.colors.primary[500],
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    marginRight: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
    letterSpacing: 0.2,
  },
  cardType: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(6),
    fontWeight: '500',
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
  },
  orientationText: {
    fontSize: moderateScale(11),
    color: theme.colors.primary[500],
    marginLeft: scale(4),
    fontWeight: '600',
  },
  chevronContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  chevronContainerSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  
  // Requirements Section
  requirementsContainer: {
    paddingHorizontal: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.lg),
  },
  requirementsSummary: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(theme.borderRadius.lg),
    padding: moderateScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  summaryText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: scale(theme.spacing.sm),
  },
  
  // Document List
  documentsList: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  requirementItem: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(theme.borderRadius.lg),
    padding: moderateScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.md),
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  requirementIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.md),
  },
  requirementDetails: {
    flex: 1,
  },
  requirementName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  requirementDescription: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(theme.spacing.sm),
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent.safetyGreen,
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  requiredText: {
    fontSize: moderateScale(11),
    color: theme.colors.background.primary,
    fontWeight: '700',
  },
  
  // Payment Section
  paymentContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(theme.borderRadius.lg),
    padding: moderateScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.lg),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(theme.spacing.md),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.secondary,
  },
  paymentIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(theme.borderRadius.md),
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.md),
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(2),
  },
  paymentDescription: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(16),
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(theme.spacing.md),
    padding: moderateScale(theme.spacing.sm),
    backgroundColor: theme.colors.accent.warningOrange + '15',
    borderRadius: moderateScale(theme.borderRadius.sm),
  },
  paymentNoteText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginLeft: scale(theme.spacing.xs),
    lineHeight: moderateScale(16),
  },
  
  // Action Buttons
  actionButtons: {
    marginBottom: verticalScale(theme.spacing.xl),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(theme.borderRadius.lg),
    paddingVertical: verticalScale(theme.spacing.lg),
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.background.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    borderRadius: moderateScale(theme.borderRadius.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: scale(theme.spacing.xl),
  },
  emptyIconContainer: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});
