import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const screenStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Content containers
  scrollContainer: {
    flex: 1,
  },
  
  contentContainer: {
    padding: theme.spacing.md,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  
  // Card styles
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  cardTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
  },
  
  cardSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  
  listItemContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  
  listItemTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  
  listItemSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs / 2,
  },
  
  // Form styles
  formContainer: {
    padding: theme.spacing.md,
  },
  
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  
  formSectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  
  inputLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  
  // Button containers
  buttonContainer: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  
  // Status indicators
  statusActive: {
    backgroundColor: theme.colors.semantic.success,
  },
  
  statusPending: {
    backgroundColor: theme.colors.semantic.warning,
  },
  
  statusError: {
    backgroundColor: theme.colors.semantic.error,
  },
  
  statusInfo: {
    backgroundColor: theme.colors.semantic.info,
  },
  
  // Badge styles
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  
  // Spacing utilities
  marginVerticalSmall: {
    marginVertical: theme.spacing.sm,
  },
  
  marginVerticalMedium: {
    marginVertical: theme.spacing.md,
  },
  
  marginVerticalLarge: {
    marginVertical: theme.spacing.lg,
  },
  
  paddingHorizontalMedium: {
    paddingHorizontal: theme.spacing.md,
  },
  
  paddingVerticalMedium: {
    paddingVertical: theme.spacing.md,
  },
  
  // Flex utilities
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  alignStart: {
    alignItems: 'flex-start',
  },
  
  alignEnd: {
    alignItems: 'flex-end',
  },
  
  flex1: {
    flex: 1,
  },
});
