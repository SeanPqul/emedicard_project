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
  header: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: verticalScale(theme.spacing.lg),
    paddingHorizontal: scale(theme.spacing.lg),
    alignItems: 'center',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: theme.colors.border.light,
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
  linksSection: {
    backgroundColor: theme.colors.background.primary,
    marginTop: verticalScale(theme.spacing.sm),
    borderTopWidth: moderateScale(1),
    borderBottomWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
  },
  section: {
    marginTop: verticalScale(theme.spacing.sm),
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: moderateScale(1),
    borderBottomWidth: moderateScale(1),
    borderColor: theme.colors.border.light,
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.sm),
    backgroundColor: theme.colors.background.secondary,
  },
  signOutSection: {
    paddingHorizontal: scale(theme.spacing.lg),
    paddingTop: verticalScale(theme.spacing.lg),
    paddingBottom: verticalScale(theme.spacing.lg),
    marginTop: verticalScale(theme.spacing.sm),
  },
});
