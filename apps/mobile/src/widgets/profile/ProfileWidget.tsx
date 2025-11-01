import React from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        {/* Inline Header with Profile */}
        <View style={styles.inlineHeaderSection}>
          <View style={styles.inlineHeader}>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>
          
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <TouchableOpacity 
              style={styles.profileContent}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.8}
            >
              {/* Profile Picture */}
              <View style={styles.profilePictureContainer}>
                {user.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={styles.profilePicture}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.profilePicture, styles.profilePicturePlaceholder]}>
                    <Text style={styles.profilePicturePlaceholderText}>👤</Text>
                  </View>
                )}
              </View>
              
              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.displayName}</Text>
                {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
                <Text style={styles.memberSince}>Member since {user.memberSince}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PERSONAL INFORMATION</Text>
          <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]} onPress={() => router.push('/profile/edit')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Manage your personal details and contact info</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ACCOUNT SETTINGS</Text>
          <TouchableOpacity style={styles.cardItem} onPress={() => router.push('/payment-history')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="wallet-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Review your payment transactions</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]} onPress={() => router.push('/profile/change-password')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Support & Help Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SUPPORT & HELP</Text>
          <TouchableOpacity style={styles.cardItem} onPress={() => router.push('/(screens)/(shared)/help-center')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cardItem} onPress={() => router.push('/(screens)/(shared)/terms')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.cardItem, styles.lastCardItem]} onPress={() => router.push('/(screens)/(shared)/privacy')}>
            <View style={styles.cardItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-outline" size={moderateScale(20)} color="#666" />
              </View>
              <Text style={styles.cardItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <SignOutButton />
        </View>
      </ScrollView>
    </View>
  );
}
