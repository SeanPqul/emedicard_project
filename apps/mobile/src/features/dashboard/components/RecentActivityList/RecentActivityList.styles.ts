import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp, hp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: theme.colors.primary[500],
    fontWeight: '600' as const,
  },
  activityList: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    marginHorizontal: scale(20),
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    marginHorizontal: scale(20),
    marginTop: verticalScale(8),
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  expandButtonText: {
    fontSize: moderateScale(14),
    color: theme.colors.primary[500],
    fontWeight: '600' as const,
    marginRight: scale(6),
  },
});
