import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ProfileLink } from '@/src/features/profile/components';
import { SignOutButton } from '@/src/features/auth/components';
import { moderateScale } from '@/src/shared/utils/responsive';
import { styles } from './ProfileWidget.styles';

interface ProfileWidgetProps {
  user: {
    displayName: string;
    email?: string;
    memberSince: number;
    imageUrl: string | null;
  };
}

export function ProfileWidget({ user }: ProfileWidgetProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={user.imageUrl}
              style={styles.profilePicture}
              placeholder="👤"
            />
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
              <Ionicons name="pencil" size={moderateScale(16)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
        </View>

        {/* Profile Links */}
        <View style={styles.linksSection}>
          <ProfileLink
            icon="person-circle-outline"
            title="Personal Information"
            description="Manage your personal details and contact info"
            onPress={() => router.push('/profile/edit')}
          />
          <ProfileLink
            icon="shield-checkmark-outline"
            title="Health Cards"
            description="View and manage your health cards"
            onPress={() => router.push('/screens/shared/health-cards')}
          />
          <ProfileLink
            icon="document-text-outline"
            title="My Applications"
            description="Track your health card applications"
            onPress={() => router.push('/(tabs)/application')}
          />
          <ProfileLink
            icon="card-outline"
            title="Payment History"
            description="Review your payment transactions"
            onPress={() => router.push('/payment-history')}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <ProfileLink
            icon="lock-closed-outline"
            title="Change Password"
            description="Update your account password"
            onPress={() => router.push('/profile/change-password')}
          />
          <ProfileLink
            icon="keypad-outline"
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            onPress={() => router.push('/profile/2fa')}
          />
        </View>

        {/* Support & Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Help</Text>
          <ProfileLink
            icon="help-circle-outline"
            title="FAQ"
            description="Find answers to common questions"
            onPress={() => router.push('/support/faq')}
          />
          <ProfileLink
            icon="mail-outline"
            title="Contact Support"
            description="Get help from our support team"
            onPress={() => router.push('/support/contact')}
          />
          <ProfileLink
            icon="information-circle-outline"
            title="About eMediCard"
            description="App version, project documentation, and system information"
            onPress={() => router.push('/about')}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <SignOutButton />
        </View>
      </ScrollView>
    </View>
  );
}
