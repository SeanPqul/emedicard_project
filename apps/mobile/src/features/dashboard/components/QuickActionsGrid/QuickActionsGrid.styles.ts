import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale, wp } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
