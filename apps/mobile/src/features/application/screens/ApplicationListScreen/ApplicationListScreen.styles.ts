import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/shared/constants/theme';
import { moderateScale, verticalScale, horizontalScale, wp, hp } from '@/src/shared/utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    paddingHorizontal: horizontalScale(SPACING.lg),
    paddingTop: verticalScale(SPACING.md),
    paddingBottom: verticalScale(SPACING.sm),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.md),
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(SPACING.md),
    paddingVertical: verticalScale(SPACING.xs),
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary.main + '20',
    marginRight: horizontalScale(SPACING.xs),
    maxWidth: wp(25),
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    marginLeft: horizontalScale(SPACING.xs),
    fontWeight: FONT_WEIGHTS.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: horizontalScale(SPACING.sm),
    paddingVertical: verticalScale(SPACING.sm),
    marginBottom: verticalScale(SPACING.sm),
  },
  searchIcon: {
    marginRight: horizontalScale(SPACING.sm),
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  filtersContainer: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.lg,
    padding: moderateScale(SPACING.sm),
    marginBottom: verticalScale(SPACING.sm),
  },
  filterSection: {
    marginBottom: verticalScale(SPACING.sm),
  },
  filterLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.sm),
  },
  filterChip: {
    paddingHorizontal: horizontalScale(SPACING.sm),
    paddingVertical: verticalScale(SPACING.xs),
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginRight: horizontalScale(SPACING.sm),
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  filterChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: hp(2),
  },
  applicationsList: {
    padding: moderateScale(SPACING.md),
  },
  applicationCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: moderateScale(SPACING.lg),
    marginBottom: verticalScale(SPACING.lg),
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(SPACING.lg),
    paddingBottom: verticalScale(SPACING.sm),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light + '30',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIndicator: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(SPACING.sm),
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: horizontalScale(SPACING.xs),
  },
  applicationId: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.xs),
  },
  applicationDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(SPACING.sm),
    paddingVertical: verticalScale(SPACING.xs),
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginLeft: horizontalScale(SPACING.xs),
  },
  cardContent: {
    marginBottom: verticalScale(SPACING.md),
  },
  jobCategory: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: verticalScale(SPACING.sm),
  },
  position: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text.primary,
    marginBottom: verticalScale(SPACING.xs),
  },
  organization: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: verticalScale(SPACING.md),
  },
  applicationDetails: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: moderateScale(SPACING.sm),
    marginBottom: verticalScale(SPACING.md),
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(SPACING.xs),
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  remarksContainer: {
    backgroundColor: COLORS.status.warning + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: moderateScale(SPACING.sm),
    borderWidth: 1,
    borderColor: COLORS.status.warning + '30',
  },
  remarksLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.status.warning,
    marginBottom: verticalScale(SPACING.xs),
  },
  remarksText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIndicator: {
    flex: 1,
    marginRight: horizontalScale(SPACING.md),
  },
  progressBar: {
    height: verticalScale(6),
    backgroundColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: verticalScale(SPACING.xs),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(SPACING.md),
    paddingVertical: verticalScale(SPACING.sm),
  },
  viewButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary.main,
    fontWeight: FONT_WEIGHTS.semibold,
    marginRight: horizontalScale(SPACING.xs),
  },
});
