import { StyleSheet } from 'react-native';
import { theme } from '../theme';
import { scaleFont, scaleSize, scaleSpacing } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: scaleSpacing(20),
    paddingVertical: scaleSpacing(16),
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: scaleSpacing(4),
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: scaleSpacing(20),
  },
  placeholderText: {
    fontSize: scaleFont(16),
    color: theme.colors.text.secondary,
    lineHeight: scaleFont(24),
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
  },
});
