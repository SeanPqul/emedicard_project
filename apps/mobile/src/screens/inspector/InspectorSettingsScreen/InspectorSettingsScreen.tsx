import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { theme } from '@shared/styles/theme';
import { useRouter } from 'expo-router';
import { useUsers } from '@features/profile';
import { SignOutButton } from '@features/auth/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export function InspectorSettingsScreen() {
  const { data: { currentUser: userProfile } } = useUsers();
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Inline Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

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
          
          {/* Admin Notice */}
          <View style={styles.adminNotice}>
            <Ionicons
              name="information-circle"
              size={moderateScale(16)}
              color={theme.colors.blue[500]}
            />
            <Text style={styles.adminNoticeText}>Account managed by administrator</Text>
          </View>
        </View>

        {/* Security Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SECURITY</Text>
          
          <TouchableOpacity
            style={[styles.cardItem, styles.lastCardItem]}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="lock-closed"
                  size={moderateScale(20)}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Change Password</Text>
                <Text style={styles.cardItemDescription}>Update your login password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#ADB5BD" />
          </TouchableOpacity>
        </View>

        {/* Support & Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SUPPORT & INFORMATION</Text>
          
          <TouchableOpacity
            style={styles.cardItem}
            onPress={() => router.push('/(screens)/(inspector)/help-center')}
            activeOpacity={0.7}
          >
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={moderateScale(20)}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.cardItemTextContainer}>
                <Text style={styles.cardItemTitle}>Help Center</Text>
                <Text style={styles.cardItemDescription}>Get help and support</Text>
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
                <Text style={styles.cardItemDescription}>App version {appVersion}</Text>
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
  titleSection: {
    paddingHorizontal: scale(20),
    paddingTop: 0,
    paddingBottom: verticalScale(8),
    backgroundColor: theme.colors.background.secondary,
  },
  pageTitle: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
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
  adminNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[50],
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(16),
    gap: scale(8),
  },
  adminNoticeText: {
    fontSize: moderateScale(12),
    color: theme.colors.blue[700],
    fontWeight: '500',
    flex: 1,
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
    height: verticalScale(90),
  },
});
