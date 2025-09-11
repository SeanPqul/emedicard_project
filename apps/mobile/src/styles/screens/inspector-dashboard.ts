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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 16,
  },
  recentActivity: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
