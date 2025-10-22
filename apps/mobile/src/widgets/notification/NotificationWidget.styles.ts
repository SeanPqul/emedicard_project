import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    color: theme.colors.text.secondary,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: moderateScale(1),
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
    fontSize: moderateScale(theme.typography.h2.fontSize),
    fontWeight: theme.typography.h2.fontWeight as any,
    lineHeight: moderateScale(theme.typography.h2.lineHeight),
    color: theme.colors.text.primary,
  },
  markAllButton: {
    paddingHorizontal: scale(theme.spacing.sm),
    paddingVertical: verticalScale(theme.spacing.xs),
    borderRadius: moderateScale(theme.borderRadius.md),
    backgroundColor: theme.colors.brand.primary + '20',
  },
  markAllButtonText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
    color: theme.colors.brand.primary,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: scale(theme.spacing.md),
    paddingTop: verticalScale(theme.spacing.md),
    paddingBottom: verticalScale(theme.spacing.sm),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: scale(theme.spacing.md),
    paddingVertical: verticalScale(theme.spacing.sm),
    borderRadius: moderateScale(theme.borderRadius.full),
    backgroundColor: theme.colors.background.tertiary,
    marginRight: scale(theme.spacing.sm),
    borderWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  categoryChipText: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  notificationsList: {
    paddingVertical: verticalScale(theme.spacing.sm),
  },
  dateSection: {
    marginBottom: verticalScale(theme.spacing.md),
  },
  dateLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(theme.spacing.lg),
    marginBottom: verticalScale(theme.spacing.sm),
  },
  dateLabelDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dateLabel: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: scale(12),
    minWidth: scale(70),
  },
  cardsContainer: {
    paddingHorizontal: 0,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(theme.spacing.sm),
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  notificationCardUnread: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    shadowOpacity: 0.08,
  },
  unreadBadge: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    zIndex: 1,
  },
  unreadDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.brand.primary,
  },
  notificationIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notificationHeader: {
    marginBottom: verticalScale(4),
  },
  notificationTitle: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19),
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: 0.1,
  },
  notificationTitleUnread: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  notificationMessage: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(4),
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(4),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: scale(theme.spacing.xs),
  },
  notificationTime: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(15),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationTimestamp: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(14),
    color: '#9CA3AF',
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
