import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

/**
 * OrientationInfoScreen
 * 
 * Provides comprehensive information about Food Safety Training orientation
 * before users schedule their session. Includes overview, requirements,
 * topics covered, venue details, and contact information.
 */
export function OrientationInfoScreen() {
  const handleScheduleNow = () => {
    router.push('/(screens)/(shared)/orientation/schedule');
  };

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
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[theme.colors.orange[500], theme.colors.orange[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={HEADER_CONSTANTS.ICON_SIZE} color={HEADER_CONSTANTS.WHITE} />
            </Pressable>

          <View style={styles.headerIcon}>
            <Ionicons name="restaurant" size={moderateScale(32)} color={theme.colors.ui.white} />
          </View>
          
          <Text style={styles.headerTitle}>Food Safety Training</Text>
          <Text style={styles.headerSubtitle}>Mandatory orientation for food handlers</Text>
          </LinearGradient>

          {/* Wave Decoration */}
          <Svg height="30" width="100%" viewBox="0 0 1440 100" style={styles.wave}>
            <Path
              fill={theme.colors.background.secondary}
              d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,58.7C1120,53,1280,43,1360,37.3L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
            />
          </Svg>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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

        {/* Fixed Bottom Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.scheduleButton,
              pressed && { opacity: 0.85 }
            ]}
            onPress={handleScheduleNow}
          >
            <LinearGradient
              colors={[theme.colors.orange[500], theme.colors.orange[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scheduleButtonGradient}
            >
              <Text style={styles.scheduleButtonText}>Schedule Orientation</Text>
              <Ionicons name="arrow-forward" size={moderateScale(20)} color={theme.colors.ui.white} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: verticalScale(38),
    paddingBottom: verticalScale(28),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: verticalScale(12),
    left: scale(16),
    width: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    zIndex: 10,
  },
  headerIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
    textAlign: 'center',
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: HEADER_CONSTANTS.WHITE,
    opacity: 0.85,
    textAlign: 'center',
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  card: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(16),
    padding: scale(20),
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.ui.white,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  scheduleButton: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  scheduleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    gap: scale(8),
  },
  scheduleButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.ui.white,
  },
});
