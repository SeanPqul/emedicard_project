import { StyleSheet } from 'react-native';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

export const styles = StyleSheet.create({
  container: {
    paddingVertical: moderateScale(4),
  },
  stepContainer: {
    marginBottom: moderateScale(4),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  iconContainer: {
    marginRight: moderateScale(12),
    width: moderateScale(20),
    alignItems: 'center',
  },
  stepText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  stepSubtitle: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    color: theme.colors.text.tertiary,
    marginTop: moderateScale(2),
  },
  stepTextCompleted: {
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  stepTextCurrent: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  stepTextUpcoming: {
    color: theme.colors.text.tertiary,
    fontWeight: '400',
  },
  connector: {
    width: 2,
    height: moderateScale(16),
    backgroundColor: theme.colors.gray[200],
    marginLeft: moderateScale(9),
  },
  connectorCompleted: {
    backgroundColor: theme.colors.semantic.success,
  },
  currentBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
    marginLeft: moderateScale(8),
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
