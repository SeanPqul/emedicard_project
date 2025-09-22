import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { verticalScale, scale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.status.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(theme.spacing.xs),
    paddingHorizontal: scale(theme.spacing.sm),
    gap: scale(theme.spacing.xs),
  },
  icon: {
    color: theme.colors.text.inverse,
  },
  text: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.inverse,
    fontWeight: '500' as const,
  },
});
