import { StyleSheet } from 'react-native';
import { theme, getShadow } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(16),
  },
  header: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  sectionSubtitle: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  cardsStack: {
    paddingHorizontal: scale(20),
    gap: verticalScale(12),
  },
  cardContainer: {
    minHeight: moderateScale(100),
    overflow: 'hidden',
    borderRadius: moderateScale(16),
  },
  cardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    ...getShadow('medium'),
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    zIndex: 10,
  },
  badgeInline: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
    marginLeft: scale(8),
  },
  badgeinfo: {
    backgroundColor: theme.colors.blue[500],
  },
  badgewarning: {
    backgroundColor: theme.colors.orange[500],
  },
  badgeerror: {
    backgroundColor: theme.colors.semantic.error,
  },
  badgesuccess: {
    backgroundColor: theme.colors.semantic.success,
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.ui.white,
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.ui.white,
  },
  cardDescription: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: moderateScale(18),
    flex: 1,
  },
  arrowIcon: {
    width: moderateScale(32),
    height: moderateScale(32),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  decorativeShape1: {
    position: 'absolute',
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -moderateScale(30),
    right: -moderateScale(30),
  },
  decorativeShape2: {
    position: 'absolute',
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -moderateScale(15),
    left: -moderateScale(15),
    transform: [{ rotate: '25deg' }],
  },
});
