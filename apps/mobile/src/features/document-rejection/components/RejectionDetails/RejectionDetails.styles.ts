import { StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  documentName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  closeButton: {
    padding: scale(theme.spacing.xs),
    marginRight: scale(-theme.spacing.xs),
    marginTop: scale(-theme.spacing.xs),
  },
  section: {
    marginBottom: verticalScale(theme.spacing.lg),
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  detailLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    width: scale(110),
  },
  detailValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
  },
  issuesContainer: {
    marginTop: verticalScale(theme.spacing.sm),
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(theme.spacing.sm),
    paddingLeft: scale(theme.spacing.sm),
  },
  issueIcon: {
    marginRight: scale(theme.spacing.sm),
    marginTop: verticalScale(2),
  },
  issueText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    flex: 1,
    lineHeight: moderateScale(20),
  },
  footer: {
    marginTop: verticalScale(theme.spacing.xl),
    paddingTop: verticalScale(theme.spacing.lg),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  resubmitButton: {
    backgroundColor: theme.colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    gap: scale(theme.spacing.sm),
  },
  resubmitButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text.inverse,
  },
});
