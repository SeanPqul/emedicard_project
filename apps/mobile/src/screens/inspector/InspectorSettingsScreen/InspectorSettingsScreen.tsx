import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { useRouter } from 'expo-router';
import { useUsers } from '@features/profile';
import { SignOutButton } from '@features/auth/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export function InspectorSettingsScreen() {
  const { data: { currentUser: userProfile } } = useUsers();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE}
              color={HEADER_CONSTANTS.WHITE}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons
              name="settings"
              size={HEADER_CONSTANTS.ICON_SIZE}
              color={HEADER_CONSTANTS.WHITE}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>Manage your inspector account</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={moderateScale(40)}
                color={theme.colors.primary[500]}
              />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile?.fullname || 'Inspector'}</Text>
            <Text style={styles.profileEmail}>{userProfile?.email || 'inspector@emedicard.com'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(14)}
                color={theme.colors.primary[500]}
              />
              <Text style={styles.roleText}>Inspector</Text>
            </View>
          </View>
        </View>

        {/* Inspector Tools Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Inspector Tools</Text>
          
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => router.push('/(screens)/(inspector)/sessions')}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={moderateScale(20)}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Orientation Sessions</Text>
                <Text style={styles.cardItemDescription}>Manage and view all sessions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => router.push('/(screens)/(inspector)/scan-history')}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={moderateScale(20)}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Scan History</Text>
                <Text style={styles.cardItemDescription}>Review past QR scans</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardItem, styles.lastCardItem]}
            onPress={() => router.push('/(screens)/(inspector)/orientation-attendance')}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="qr-code-outline"
                  size={moderateScale(20)}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>QR Scanner</Text>
                <Text style={styles.cardItemDescription}>Scan attendee QR codes</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>
        </View>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="person-outline"
                  size={moderateScale(20)}
                  color="#666"
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Edit Profile</Text>
                <Text style={styles.cardItemDescription}>Update your personal information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardItem, styles.lastCardItem]}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={moderateScale(20)}
                  color="#666"
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Change Password</Text>
                <Text style={styles.cardItemDescription}>Update your account password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>
        </View>

        {/* Support Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support & Help</Text>
          
          <TouchableOpacity
            style={styles.cardItem}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={moderateScale(20)}
                  color="#666"
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Help Center</Text>
                <Text style={styles.cardItemDescription}>Find answers to common questions</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardItem, styles.lastCardItem]}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={moderateScale(20)}
                  color="#666"
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>About</Text>
                <Text style={styles.cardItemDescription}>App version and information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <SignOutButton />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: moderateScale(12),
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: verticalScale(4),
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(24),
  },
  profileSection: {
    backgroundColor: HEADER_CONSTANTS.WHITE,
    marginHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    marginTop: verticalScale(16),
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(3),
    borderColor: theme.colors.primary[500],
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#212529',
    marginBottom: verticalScale(4),
  },
  profileEmail: {
    fontSize: moderateScale(14),
    color: '#6C757D',
    marginBottom: verticalScale(12),
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: moderateScale(1),
    borderColor: theme.colors.primary[200],
  },
  roleText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.primary[500],
    marginLeft: moderateScale(6),
  },
  card: {
    backgroundColor: HEADER_CONSTANTS.WHITE,
    marginHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    marginTop: verticalScale(16),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#6C757D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(12),
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
    borderTopWidth: moderateScale(1),
    borderTopColor: '#E9ECEF',
  },
  lastCardItem: {
    borderBottomWidth: 0,
  },
  cardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardItemTextContainer: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  cardItemTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#212529',
    marginBottom: verticalScale(2),
  },
  cardItemDescription: {
    fontSize: moderateScale(13),
    color: '#6C757D',
  },
  signOutSection: {
    marginHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    marginTop: verticalScale(24),
  },
  bottomSpacer: {
    height: verticalScale(24),
  },
});
