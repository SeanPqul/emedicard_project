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
  // Modern Inline Header Styles
  inlineHeaderSection: {
    backgroundColor: theme.colors.background.primary,
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(16),
    marginBottom: verticalScale(16),
  },
  inlineHeader: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(12),
  },
  pageTitle: {
    fontSize: moderateScale(22),
    fontWeight: '600',
    letterSpacing: -0.3,
    color: theme.colors.text.primary,
  },
  profileCard: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    borderRadius: moderateScale(16),
    ...theme.shadows?.medium,
    overflow: 'hidden',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
  },
  profilePictureContainer: {
    marginRight: scale(16),
  },
  profilePicture: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: theme.colors.gray[200],
  },
  profilePicturePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
  },
  profilePicturePlaceholderText: {
    fontSize: moderateScale(32),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(2),
  },
  userEmail: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(4),
  },
  memberSince: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: theme.colors.text.tertiary,
  },
});
