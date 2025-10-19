import { StyleSheet } from 'react-native';
import { theme, getShadow } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginTop: verticalScale(16),
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  infoCardsSection: {
    marginTop: verticalScale(32),
    paddingHorizontal: scale(20),
  },
  infoCard: {
    marginBottom: verticalScale(12),
  },
  infoCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: moderateScale(16),
    ...getShadow('small'),
  },
  infoCardIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(2),
  },
  infoCardDescription: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
  },
  healthTipsCard: {
    marginBottom: verticalScale(12),
  },
  bottomSpacing: {
    height: verticalScale(100),
  },
});
