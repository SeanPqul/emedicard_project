import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { useUsers } from '@/src/features/profile/hooks/useUsers';

/**
 * ProfileEditScreen
 * 
 * Allows users to edit their personal details and contact information.
 * Follows project's inline header pattern.
 */
export function ProfileEditScreen() {
  const { user: clerkUser } = useUser();
  const { data, isLoading, mutations } = useUsers();
  const currentUser = data?.currentUser;

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      const nameParts = currentUser.fullname?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      if (nameParts.length > 2) {
        setMiddleName(nameParts.slice(1, -1).join(' ') || '');
        setLastName(nameParts[nameParts.length - 1] || '');
      } else {
        setMiddleName('');
        setLastName(nameParts.slice(1).join(' ') || '');
      }
    } else if (clerkUser) {
      setFirstName(clerkUser.firstName || '');
      setLastName(clerkUser.lastName || '');
      setMiddleName('');
    }
  }, [currentUser, clerkUser]);

  const handleSave = async () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required.');
      return;
    }

    setIsSaving(true);
    try {
      // Update via backend - this syncs with both Clerk and database
      await mutations.updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // Reload Clerk user to reflect changes immediately in UI
      if (clerkUser) {
        await clerkUser.reload();
      }

      Alert.alert('Success', 'Your profile has been updated successfully.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
      ]);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <BaseScreen safeArea={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.green[600]} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Inline Title with Back Button */}
          <View style={styles.titleSection}>
            <TouchableOpacity
              style={styles.inlineBackButton}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={moderateScale(24)}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.titleContent}>
              <Text style={styles.pageTitle}>Edit Profile</Text>
              <Text style={styles.pageSubtitle}>Update your personal information</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Personal Information Section */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSubtitle}>Update your legal name as it appears on your ID</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Middle Name</Text>
              <TextInput
                style={styles.input}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Enter your middle name (optional)"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
              <Text style={styles.helperText}>Leave blank if you don't have a middle name</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            {/* Account Information Section */}
            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Account Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>
                  {clerkUser?.primaryEmailAddress?.emailAddress || 'Not available'}
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.colors.ui.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={moderateScale(20)} color={theme.colors.ui.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.push('/(tabs)/profile')}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
    backgroundColor: theme.colors.background.secondary,
  },
  inlineBackButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(-8),
    marginRight: scale(8),
  },
  titleContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: moderateScale(24),
    fontWeight: '600',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
    marginBottom: verticalScale(4),
  },
  pageSubtitle: {
    fontSize: moderateScale(15),
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  card: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(16),
    padding: scale(20),
    marginHorizontal: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  sectionSubtitle: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(16),
  },
  sectionSpacing: {
    marginTop: verticalScale(24),
  },
  formGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  required: {
    color: theme.colors.red[600],
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: moderateScale(12),
    padding: scale(12),
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.ui.white,
  },
  disabledInput: {
    backgroundColor: theme.colors.gray[100],
    borderColor: theme.colors.gray[200],
  },
  disabledText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.tertiary,
  },
  helperText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    marginTop: verticalScale(4),
  },
  buttonContainer: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
    gap: verticalScale(12),
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.green[600],
    borderRadius: moderateScale(12),
    padding: scale(16),
    gap: scale(8),
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.ui.white,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: moderateScale(12),
    padding: scale(16),
  },
  cancelButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  bottomSpacer: {
    height: verticalScale(16),
  },
});
