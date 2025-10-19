import { StyleSheet } from 'react-native';
import { theme, getShadow } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: moderateScale(180),
    marginBottom: verticalScale(12),
  },
  containerCentered: {
    width: '47%',
    minHeight: moderateScale(180),
    marginBottom: verticalScale(12),
    alignSelf: 'flex-start',
  },
  gradientBackground: {
    flex: 1,
    borderRadius: moderateScale(20),
    padding: scale(16),
    ...getShadow('large'),
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
    gap: scale(5),
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    backgroundColor: theme.colors.semantic.error,
    marginLeft: scale(4),
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: theme.colors.ui.white,
  },
  valueSection: {
    marginBottom: verticalScale(8),
  },
  value: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: theme.colors.ui.white,
    lineHeight: moderateScale(34),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  trendText: {
    fontSize: moderateScale(12),
    color: theme.colors.ui.white,
    marginLeft: scale(4),
    fontWeight: '500',
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.ui.white,
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: moderateScale(18),
  },
  progressContainer: {
    marginTop: verticalScale(12),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
    marginBottom: verticalScale(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: moderateScale(3),
  },
  progressText: {
    fontSize: moderateScale(11),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  decorativeCircle: {
    position: 'absolute',
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -moderateScale(40),
    right: -moderateScale(40),
  },
  decorativeLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  actionIndicator: {
    position: 'absolute',
    bottom: scale(16),
    right: scale(16),
    width: moderateScale(32),
    height: moderateScale(32),
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
});
