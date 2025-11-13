import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * TermsScreen
 * 
 * Displays the Terms & Conditions for the eMediCard application.
 */
export function TermsScreen() {
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
              <Text style={styles.pageTitle}>Terms & Conditions</Text>
              <Text style={styles.pageSubtitle}>Last updated: October 2025</Text>
            </View>
          </View>

          {/* Content Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using the eMediCard mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this application.
            </Text>

            <Text style={styles.sectionTitle}>2. Purpose</Text>
            <Text style={styles.paragraph}>
              eMediCard is an official digital platform for processing health card applications and renewals for workers in Davao City, as mandated by the City Health Office. The application facilitates the submission, payment, and issuance of health cards required for employment in regulated industries.
            </Text>

            <Text style={styles.sectionTitle}>3. User Eligibility</Text>
            <Text style={styles.paragraph}>This application is intended for:</Text>
            <Text style={styles.bulletPoint}>• Applicants seeking health card certification in Davao City</Text>
            <Text style={styles.bulletPoint}>• Employers managing their employees' health card applications</Text>
            <Text style={styles.bulletPoint}>• Authorized City Health Office personnel</Text>
            <Text style={styles.bulletPoint}>• Minors must have parental consent</Text>

            <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
            <Text style={styles.paragraph}>You agree to:</Text>
            <Text style={styles.bulletPoint}>• Provide accurate and truthful information</Text>
            <Text style={styles.bulletPoint}>• Submit authentic documents and medical records</Text>
            <Text style={styles.bulletPoint}>• Maintain the confidentiality of your account credentials</Text>
            <Text style={styles.bulletPoint}>• Comply with all requirements set by the City Health Office</Text>
            <Text style={styles.bulletPoint}>• Pay all applicable fees on time</Text>

            <Text style={styles.sectionTitle}>5. Application Process</Text>
            <Text style={styles.paragraph}>
              Applications are subject to review and approval by the City Health Office. The health card issuance is conditional upon:
            </Text>
            <Text style={styles.bulletPoint}>• Completion of required medical examinations</Text>
            <Text style={styles.bulletPoint}>• Submission of valid documents</Text>
            <Text style={styles.bulletPoint}>• Payment of application fees</Text>
            <Text style={styles.bulletPoint}>• Attendance at required orientations</Text>
            <Text style={styles.bulletPoint}>• Passing all health screenings</Text>

            <Text style={styles.sectionTitle}>6. Payment Terms & Refund Policy</Text>
            <Text style={styles.paragraph}>
              All payments are processed through authorized payment gateways (Maya for digital payments, or over-the-counter at Barangay Halls and Sangguniang Panlungsod ng Dabaw). Payment confirmation does not guarantee health card approval.
            </Text>
            <Text style={styles.paragraph}>Important payment conditions:</Text>
            <Text style={styles.bulletPoint}>• Application fees are non-refundable once paid</Text>
            <Text style={styles.bulletPoint}>• If your application is rejected due to failed medical requirements, incomplete documents, or false information, the payment will NOT be refunded</Text>
            <Text style={styles.bulletPoint}>• Refunds are only issued if the City Health Office cancels your application due to administrative or technical errors on their part</Text>
            <Text style={styles.bulletPoint}>• Processing fees are final and non-refundable regardless of application outcome</Text>
            <Text style={styles.bulletPoint}>• You are responsible for ensuring all documents and medical test results meet requirements before payment</Text>

            <Text style={styles.sectionTitle}>7. Data Usage</Text>
            <Text style={styles.paragraph}>
              Your personal and medical information will be used exclusively for health card processing and City Health Office records. See our Privacy Policy for detailed information on data handling.
            </Text>

            <Text style={styles.sectionTitle}>8. Health Card Validity</Text>
            <Text style={styles.paragraph}>
              Health cards issued through this application are valid for the period specified by the City Health Office based on your job category. Users are responsible for timely renewal before expiration.
            </Text>

            <Text style={styles.sectionTitle}>9. Prohibited Activities</Text>
            <Text style={styles.paragraph}>You may not:</Text>
            <Text style={styles.bulletPoint}>• Submit false or fraudulent information</Text>
            <Text style={styles.bulletPoint}>• Use another person's identity or documents</Text>
            <Text style={styles.bulletPoint}>• Attempt to manipulate or bypass the application process</Text>
            <Text style={styles.bulletPoint}>• Share your digital health card credentials with others</Text>
            <Text style={styles.bulletPoint}>• Use the application for any illegal purposes</Text>

            <Text style={styles.sectionTitle}>10. Account Termination</Text>
            <Text style={styles.paragraph}>
              The City Health Office reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activities. Terminated accounts forfeit all pending applications and fees.
            </Text>

            <Text style={styles.sectionTitle}>11. Legal Basis</Text>
            <Text style={styles.paragraph}>This application operates under:</Text>
            <Text style={styles.bulletPoint}>• Republic Act No. 10611 (Food Safety Act of 2013)</Text>
            <Text style={styles.bulletPoint}>• Presidential Decree No. 856 (Sanitation Code of the Philippines)</Text>
            <Text style={styles.bulletPoint}>• Local ordinances of Davao City</Text>

            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              The City Health Office reserves the right to modify these terms at any time. Users will be notified of significant changes through the application. Continued use after changes constitutes acceptance of the new terms.
            </Text>

            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.paragraph}>
              For questions about these terms, contact the City Health Office:
            </Text>
            <Text style={styles.bulletPoint}>• Phone: 0926-686-1531 / 0999-938-0540</Text>
            <Text style={styles.bulletPoint}>• Email: cho@davaocity.gov.ph</Text>
            <Text style={styles.bulletPoint}>• Address: Door 7, Magsaysay Park Complex, Ramon Magsaysay Avenue, Barangay 23-C (Poblacion), Davao City</Text>
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
    marginTop: verticalScale(20),
    marginBottom: verticalScale(8),
  },
  paragraph: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
  },
  bulletPoint: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(6),
    paddingLeft: scale(8),
  },
  bottomSpacer: {
    height: verticalScale(16),
  },
});
