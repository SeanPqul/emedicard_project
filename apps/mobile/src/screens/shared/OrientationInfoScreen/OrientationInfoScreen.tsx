import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * OrientationInfoScreen
 * 
 * Provides comprehensive information about Food Safety Training orientation
 * before users schedule their session. Includes overview, requirements,
 * topics covered, venue details, and contact information.
 */
export function OrientationInfoScreen() {
  const topics = [
    'Personal Hygiene and Sanitation',
    'Food Safety Principles',
    'Cross-Contamination Prevention',
    'Proper Food Storage and Temperature Control',
    'Cleaning and Disinfection Procedures',
    'Food-borne Illness Prevention',
    'Safe Food Handling Practices',
    'Philippine Food Safety Regulations',
  ];

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
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={moderateScale(24)}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.titleContent}>
              <Text style={styles.pageTitle}>Food Safety Training</Text>
              <Text style={styles.pageSubtitle}>Mandatory orientation for food handlers</Text>
            </View>
          </View>
            {/* Overview Card */}
            <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={moderateScale(24)} color={theme.colors.blue[500]} />
            <Text style={styles.cardTitle}>Overview</Text>
          </View>
            <Text style={styles.cardDescription}>
              This mandatory orientation program is designed to ensure all food handlers understand 
              and comply with food safety standards required by the Department of Health. The training 
              covers essential practices to prevent foodborne illnesses and maintain public health standards.
            </Text>
          </View>

          {/* Who Must Attend */}
          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={moderateScale(24)} color={theme.colors.primary[500]} />
            <Text style={styles.cardTitle}>Who Must Attend</Text>
          </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>Food service workers and kitchen staff</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>Restaurant and cafeteria employees</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>Catering and food preparation personnel</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>Food handlers in hotels and resorts</Text>
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={moderateScale(24)} color={theme.colors.primary[500]} />
              <Text style={styles.cardTitle}>Requirements</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color={theme.colors.green[500]} />
              <Text style={styles.requirementText}>Submitted health card application</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color={theme.colors.green[500]} />
              <Text style={styles.requirementText}>Valid government-issued ID</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color={theme.colors.green[500]} />
              <Text style={styles.requirementText}>Confirmed orientation booking</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle-outline" size={moderateScale(20)} color={theme.colors.green[500]} />
              <Text style={styles.requirementText}>Attendance for full duration (1 hour)</Text>
            </View>
          </View>

          {/* Topics Covered */}
          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={moderateScale(24)} color={theme.colors.indigo[500]} />
            <Text style={styles.cardTitle}>Topics Covered</Text>
          </View>
            {topics.map((topic, index) => (
              <View key={index} style={styles.topicItem}>
                <View style={styles.topicNumber}>
                  <Text style={styles.topicNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
          </View>

          {/* Need More Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={moderateScale(24)} color={theme.colors.blue[500]} />
              <Text style={styles.cardTitle}>Need More Information?</Text>
            </View>
            <Text style={styles.contactDescription}>
              Visit the Help Center for venue details, contact information, and complete health card requirements.
            </Text>
            
            <Pressable 
              style={({ pressed }) => [
                styles.helpCenterButton,
                pressed && { opacity: 0.85 }
              ]}
              onPress={() => router.push('/(screens)/(shared)/help-center')}
            >
              <Ionicons name="help-circle" size={moderateScale(20)} color={theme.colors.indigo[600]} />
              <Text style={styles.helpCenterButtonText}>Go to Help Center</Text>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.indigo[600]} />
            </Pressable>
          </View>

          {/* Bottom spacing */}
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
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    gap: scale(12),
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  cardDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: verticalScale(12),
    gap: scale(12),
  },
  bullet: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: theme.colors.primary[500],
    marginTop: verticalScale(8),
  },
  listText: {
    flex: 1,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    gap: scale(12),
  },
  requirementText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    gap: scale(12),
  },
  topicNumber: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: theme.colors.indigo[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicNumberText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.indigo[600],
  },
  topicText: {
    flex: 1,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
  },
  contactDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
  },
  helpCenterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.indigo[50],
    padding: scale(16),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  helpCenterButtonText: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.indigo[600],
  },
  bottomSpacer: {
    height: verticalScale(16),
  },
});
