import { StyleSheet } from "react-native";
import { theme } from "@/src/shared/styles/theme";
import { moderateScale, verticalScale, scale } from "@/src/shared/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray background
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: verticalScale(theme.spacing.lg),
    paddingHorizontal: scale(theme.spacing.lg),
    alignItems: 'center',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
    marginBottom: verticalScale(16),
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  profilePicture: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: theme.borderRadius.full,
    borderWidth: moderateScale(3),
    borderColor: theme.colors.accent.medicalBlue,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent.medicalBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: theme.colors.background.primary,
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  userEmail: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(theme.spacing.sm),
  },
  memberSince: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
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
    paddingBottom: verticalScale(20),
  },
});
