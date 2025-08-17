import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { SignOutButton, ProfileLink } from '../../src/components';
import { styles } from '../../src/styles/screens/tabs-profile';
import { getUserDisplayName } from '../../src/utils/user-utils';
import { useUsers } from '../../src/hooks/useUsers';
import { User } from '../../src/types';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await users.getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

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
              source={{ uri: user?.imageUrl || userProfile?.image }}
              style={styles.profilePicture}
              placeholder="👤"
            />
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{getUserDisplayName(user, userProfile)}</Text>
          <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress || userProfile?.email}</Text>
          <Text style={styles.memberSince}>Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</Text>
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
