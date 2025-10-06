import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, moderateScale, verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Header
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  
  // Filter Pills
  filterContainer: {
    paddingVertical: verticalScale(8),
  },
  filterScroll: {
    paddingLeft: scale(16),
  },
  filterPill: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginRight: scale(8),
  },
  filterPillActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  filterPillText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  filterPillTextActive: {
    color: theme.colors.text.inverse,
  },
  
  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: verticalScale(16),
  },
  
  // Date Section
  dateSection: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  dateHeader: {
    fontSize: moderateScale(13),
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: verticalScale(8),
  },
  
  // Rejection Item Container
  rejectionItemContainer: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
  },
  emptyIcon: {
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});
