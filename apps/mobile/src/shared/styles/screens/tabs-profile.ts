import { StyleSheet } from "react-native";
import { getBorderRadius, getColor, getSpacing, getTypography } from "@shared/styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: getColor('background.primary'),
    paddingVertical: getSpacing('lg'),
    paddingHorizontal: getSpacing('lg'),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: getSpacing('sm'),
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: getBorderRadius('full'),
    borderWidth: 3,
    borderColor: getColor('accent.medicalBlue'),
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: getColor('background.primary'),
  },
  userName: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  userEmail: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('sm'),
  },
  memberSince: {
    ...getTypography('caption'),
    color: getColor('text.tertiary'),
  },
  linksSection: {
    backgroundColor: getColor('background.primary'),
    marginTop: getSpacing('sm'),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: getColor('border.light'),
  },
  section: {
    marginTop: getSpacing('sm'),
    backgroundColor: getColor('background.primary'),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: getColor('border.light'),
  },
  sectionTitle: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.secondary'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    backgroundColor: getColor('background.secondary'),
  },
  signOutSection: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
    paddingBottom: getSpacing('lg'),
    marginTop: getSpacing('sm'),
  },
});
