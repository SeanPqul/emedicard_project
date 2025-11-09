import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, moderateScale, verticalScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Header (Inline style matching HelpCenter)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
    backgroundColor: theme.colors.background.secondary,
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(-8),
    marginRight: scale(8),
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    fontSize: moderateScale(15),
    fontWeight: '400' as const,
    color: theme.colors.text.secondary,
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
