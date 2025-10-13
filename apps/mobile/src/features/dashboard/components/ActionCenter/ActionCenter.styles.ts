import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, scaleFont } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(12),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: theme.colors.orange[400],
    shadowColor: theme.colors.orange[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  title: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: theme.colors.orange[600],
    marginLeft: moderateScale(8),
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.orange[500],
    borderRadius: moderateScale(10),
    minWidth: moderateScale(22),
    height: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(6),
  },
  badgeText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: '#fff',
  },
  actionsList: {
    gap: moderateScale(8),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  actionItemUrgent: {
    backgroundColor: theme.colors.semantic.error + '08',
    borderColor: theme.colors.semantic.error,
    borderWidth: 2,
  },
  iconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: moderateScale(2),
  },
  actionTitleUrgent: {
    color: theme.colors.semantic.error,
  },
  actionSubtitle: {
    fontSize: scaleFont(13),
    color: theme.colors.text.secondary,
    lineHeight: scaleFont(18),
  },
  emptyState: {
    paddingVertical: moderateScale(16),
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: scaleFont(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
