import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
  },
});
