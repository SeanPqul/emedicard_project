import { Dimensions, StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.sm),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.brand.secondary + '20',
    marginRight: scale(theme.spacing.xs),
    maxWidth: wp(25),
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.brand.secondary,
    marginLeft: scale(theme.spacing.xs),
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.sm),
  },
  searchIcon: {
    marginRight: scale(theme.spacing.sm),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  filtersContainer: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.sm),
  },
  filterSection: {
    marginBottom: verticalScale(theme.spacing.sm),
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  filterChip: {
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginRight: scale(theme.spacing.sm),
  },
  filterChipActive: {
    backgroundColor: theme.colors.brand.secondary,
    borderColor: theme.colors.brand.secondary,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: hp(2),
  },
  applicationsList: {
    padding: moderateScale(theme.spacing.md),
  },
  applicationCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: moderateScale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.lg),
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
    paddingBottom: verticalScale(theme.spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light + '30',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIndicator: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.sm),
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: scale(theme.spacing.xs),
  },
  applicationId: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  applicationDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: scale(theme.spacing.xs),
  },
  cardContent: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  jobCategory: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  position: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  organization: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.md),
  },
  applicationDetails: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(theme.spacing.sm),
    marginBottom: verticalScale(theme.spacing.md),
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(theme.spacing.xs),
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  remarksContainer: {
    backgroundColor: theme.colors.status.warning + '10',
    borderRadius: theme.borderRadius.md,
    padding: moderateScale(theme.spacing.sm),
    borderWidth: 1,
    borderColor: theme.colors.status.warning + '30',
  },
  remarksLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.status.warning,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  remarksText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIndicator: {
    flex: 1,
    marginRight: scale(theme.spacing.md),
  },
  progressBar: {
    height: verticalScale(6),
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.full,
    marginBottom: verticalScale(theme.spacing.xs),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
  },
  viewButtonText: {
    fontSize: 14,
    color: theme.colors.brand.secondary,
    fontWeight: '600' as const,
    marginRight: scale(theme.spacing.xs),
  },
});
