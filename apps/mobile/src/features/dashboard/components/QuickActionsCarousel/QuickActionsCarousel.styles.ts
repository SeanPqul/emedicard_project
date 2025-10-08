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
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  cardContainer: {
    marginRight: scale(16),
    height: moderateScale(200),
  },
  cardGradient: {
    flex: 1,
    borderRadius: moderateScale(20),
    padding: scale(20),
    ...getShadow('large'),
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
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
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.ui.white,
    marginBottom: verticalScale(8),
  },
  cardDescription: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: moderateScale(20),
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
    marginTop: verticalScale(12),
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.ui.white,
    marginRight: scale(6),
  },
  decorativeShape1: {
    position: 'absolute',
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -moderateScale(50),
    right: -moderateScale(50),
  },
  decorativeShape2: {
    position: 'absolute',
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -moderateScale(20),
    left: -moderateScale(20),
    transform: [{ rotate: '45deg' }],
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(16),
  },
  pageIndicator: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.gray[300],
    marginHorizontal: scale(4),
  },
  pageIndicatorActive: {
    backgroundColor: theme.colors.primary[500],
    width: moderateScale(24),
  },
});
