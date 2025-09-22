import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { verticalScale } from '@/shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  message: {
    marginTop: verticalScale(theme.spacing.md),
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
