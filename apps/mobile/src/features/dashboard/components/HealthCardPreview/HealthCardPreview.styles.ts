import { StyleSheet } from 'react-native';
import { theme, getShadow } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(12),
  },
  
  // Health Card Styles
  gradientBackground: {
    borderRadius: moderateScale(16),
    padding: scale(20),
    minHeight: moderateScale(180),
    ...getShadow('large'),
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.ui.white,
    marginBottom: verticalScale(4),
  },
  cardType: {
    fontSize: moderateScale(14),
    color: theme.colors.ui.white,
    opacity: 0.9,
  },
  qrContainer: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(8),
    padding: scale(8),
    ...getShadow('small'),
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: theme.colors.ui.white,
    letterSpacing: moderateScale(1),
    marginBottom: verticalScale(8),
  },
  holderName: {
    fontSize: moderateScale(16),
    color: theme.colors.ui.white,
    opacity: 0.95,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: moderateScale(12),
    color: theme.colors.ui.white,
    opacity: 0.8,
    marginBottom: verticalScale(2),
  },
  dateText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.ui.white,
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  statusText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.ui.white,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: theme.colors.ui.white,
    opacity: 0.1,
    top: -moderateScale(50),
    right: -moderateScale(50),
  },
  decorativeCircle2: {
    position: 'absolute',
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: theme.colors.ui.white,
    opacity: 0.05,
    bottom: -moderateScale(30),
    left: -moderateScale(30),
  },
  
  // Application Status Card Styles
  applicationCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    padding: scale(18),
    ...getShadow('medium'),
    borderWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  applicationInfo: {
    flex: 1,
  },
  applicationTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: scale(8),
  },
  statusLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    marginBottom: verticalScale(16),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: theme.colors.gray[200],
    borderRadius: moderateScale(3),
    overflow: 'hidden',
    marginBottom: verticalScale(8),
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
  progressText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
  },
  
  
  // Common Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(12),
  },
  actionText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
});
