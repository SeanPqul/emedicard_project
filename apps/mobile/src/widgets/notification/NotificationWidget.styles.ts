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
    paddingHorizontal: scale(theme.spacing.md),
    paddingTop: verticalScale(theme.spacing.md),
  },
  dateSection: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  dateLabel: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    lineHeight: moderateScale(theme.typography.body.lineHeight),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.sm),
    paddingHorizontal: scale(theme.spacing.xs),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(theme.borderRadius.lg),
    padding: scale(theme.spacing.md),
    marginBottom: verticalScale(theme.spacing.sm),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: moderateScale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
    elevation: 1,
    position: 'relative',
  },
  notificationItemUnread: {
    backgroundColor: theme.colors.background.tertiary,
    borderLeftWidth: moderateScale(4),
    borderLeftColor: theme.colors.brand.primary,
  },
  notificationIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(theme.borderRadius.full),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(theme.spacing.sm),
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.xs),
  },
  notificationTitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    lineHeight: moderateScale(theme.typography.body.lineHeight),
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  notificationTime: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.text.secondary,
    marginLeft: scale(theme.spacing.sm),
  },
  notificationMessage: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    lineHeight: moderateScale(20),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  notificationAction: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(theme.typography.caption.lineHeight),
    color: theme.colors.brand.primary,
    fontWeight: '500',
  },
  unreadIndicator: {
    position: 'absolute',
    top: verticalScale(theme.spacing.md),
    right: scale(theme.spacing.md),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(theme.borderRadius.full),
    backgroundColor: theme.colors.brand.primary,
  },
});
