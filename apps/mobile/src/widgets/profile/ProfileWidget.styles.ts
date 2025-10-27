import { StyleSheet } from "react-native";
import { theme } from "@/src/shared/styles/theme";
import { moderateScale, verticalScale, scale } from "@/src/shared/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...theme.typography.bodySmall,
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(12),
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderTopWidth: moderateScale(1),
    borderTopColor: '#F0F0F0',
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  cardItemText: {
    ...theme.typography.body,
    fontSize: moderateScale(15),
    color: theme.colors.text.primary,
    flex: 1,
  },
  lastCardItem: {
    borderBottomLeftRadius: moderateScale(12),
    borderBottomRightRadius: moderateScale(12),
  },
  signOutSection: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(100),
  },
});
