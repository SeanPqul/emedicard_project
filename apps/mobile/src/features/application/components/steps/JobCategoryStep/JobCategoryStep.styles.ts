import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.lg),
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
    marginBottom: verticalScale(theme.spacing.md),
    lineHeight: moderateScale(20),
  },
  // Color Guide
  colorGuide: {
    backgroundColor: '#F8F9FA',
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    marginBottom: verticalScale(theme.spacing.lg),
  },
  colorGuideTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(theme.spacing.xs),
  },
  colorGuideRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(theme.spacing.sm),
  },
  colorGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: scale(6),
  },
  colorGuideText: {
    fontSize: moderateScale(11),
    color: '#6B7280',
  },
  // Category Grid - 2 columns
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(theme.spacing.xl),
  },
  categoryCard: {
    width: (width - scale(55)) / 2,
    minHeight: verticalScale(150),
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.sm),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: moderateScale(2),
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
    position: 'relative',
  },
  categoryCardSelected: {
    // Border color changes dynamically in component
    // Keeping same border width to prevent layout shift
  },
  categoryCardCentered: {
    alignSelf: 'center',
    width: (width - scale(52)) / 2,
  },
  // Color Badge on card
  colorBadge: {
    position: 'absolute',
    top: scale(theme.spacing.sm),
    right: scale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.xs),
    paddingVertical: verticalScale(2),
    borderRadius: theme.borderRadius.sm,
  },
  colorBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Icon Container
  categoryIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  // Category Name
  categoryName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.xs),
  },
  // Job Examples Text
  jobExamples: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: verticalScale(theme.spacing.xs),
    lineHeight: moderateScale(14),
  },
  // Orientation Badge
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F18F0120',
    paddingHorizontal: scale(theme.spacing.xs),
    paddingVertical: verticalScale(2),
    borderRadius: theme.borderRadius.sm,
    marginTop: verticalScale(theme.spacing.sm),
  },
  orientationText: {
    fontSize: moderateScale(10),
    color: '#F18F01',
    marginLeft: scale(4),
    fontWeight: '600',
  },
  // Selected Checkmark
  selectedCheckmark: {
    position: 'absolute',
    top: moderateScale(-2),
    right: moderateScale(-2),
    borderRadius: theme.borderRadius.full,
    padding: moderateScale(4),
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(64),
  },
  emptyText: {
    marginTop: verticalScale(theme.spacing.md),
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(theme.spacing.md),
  },
  errorText: {
    marginLeft: scale(theme.spacing.xs),
    color: theme.colors.semantic.error,
    fontSize: moderateScale(14),
  },
  // Help Text Container
  helpTextContainer: {
    backgroundColor: '#2E86AB10',
    padding: scale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: '#2E86AB'
  },
  helpText: {
    fontSize: moderateScale(13),
    color: '#2E86AB',
    fontWeight: '600',
  },
});

export default styles;
