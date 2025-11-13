import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * PrivacyScreen
 * 
 * Displays the Privacy Policy for the eMediCard application.
 */
export function PrivacyScreen() {
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
              <Text style={styles.pageTitle}>Privacy Policy</Text>
              <Text style={styles.pageSubtitle}>Last updated: October 2025</Text>
            </View>
          </View>

          {/* Content Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              The City Health Office of Davao City (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and security of your personal and health information. This Privacy Policy explains how we collect, use, store, and protect your data when you use the eMediCard mobile application.
            </Text>

            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect the following types of information:
            </Text>
            
            <Text style={styles.subSectionTitle}>Personal Information:</Text>
            <Text style={styles.bulletPoint}>• Full name, date of birth, and contact details</Text>
            <Text style={styles.bulletPoint}>• Email address and phone number</Text>
            <Text style={styles.bulletPoint}>• Home address and employment information</Text>
            <Text style={styles.bulletPoint}>• Valid identification documents</Text>
            <Text style={styles.bulletPoint}>• Profile photograph</Text>

            <Text style={styles.subSectionTitle}>Health Information:</Text>
            <Text style={styles.bulletPoint}>• Medical examination results</Text>
            <Text style={styles.bulletPoint}>• Laboratory test results</Text>
            <Text style={styles.bulletPoint}>• Health screening records</Text>
            <Text style={styles.bulletPoint}>• Vaccination records (if applicable)</Text>
            <Text style={styles.bulletPoint}>• Medical certificates</Text>

            <Text style={styles.subSectionTitle}>Technical Information:</Text>
            <Text style={styles.bulletPoint}>• Device information (model, OS version)</Text>
            <Text style={styles.bulletPoint}>• IP address and location data</Text>
            <Text style={styles.bulletPoint}>• Application usage data and logs</Text>
            <Text style={styles.bulletPoint}>• Payment transaction records</Text>
            <Text style={styles.bulletPoint}>• Push notification tokens and preferences</Text>
            <Text style={styles.bulletPoint}>• QR code data for health card verification</Text>

            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              Your information is used for the following purposes:
            </Text>
            <Text style={styles.bulletPoint}>• Processing health card applications and renewals</Text>
            <Text style={styles.bulletPoint}>• Verifying identity and eligibility</Text>
            <Text style={styles.bulletPoint}>• Conducting medical examinations and screenings</Text>
            <Text style={styles.bulletPoint}>• Issuing digital health cards with QR codes for verification</Text>
            <Text style={styles.bulletPoint}>• Processing payments through digital and over-the-counter methods</Text>
            <Text style={styles.bulletPoint}>• Maintaining payment transaction records</Text>
            <Text style={styles.bulletPoint}>• Scheduling orientations and medical examinations</Text>
            <Text style={styles.bulletPoint}>• Sending application status updates and push notifications</Text>
            <Text style={styles.bulletPoint}>• Enabling health card renewals and tracking expiration dates</Text>
            <Text style={styles.bulletPoint}>• Compliance with health regulations and sanitary inspections</Text>
            <Text style={styles.bulletPoint}>• Improving application functionality and user experience</Text>

            <Text style={styles.sectionTitle}>4. Legal Basis for Processing</Text>
            <Text style={styles.paragraph}>
              We process your personal and health information under the following legal bases:
            </Text>
            <Text style={styles.bulletPoint}>• Republic Act No. 10173 (Data Privacy Act of 2012)</Text>
            <Text style={styles.bulletPoint}>• Republic Act No. 10611 (Food Safety Act of 2013)</Text>
            <Text style={styles.bulletPoint}>• Presidential Decree No. 856 (Sanitation Code of the Philippines)</Text>
            <Text style={styles.bulletPoint}>• Local ordinances of Davao City</Text>
            <Text style={styles.bulletPoint}>• Your explicit consent when using this application</Text>

            <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
            <Text style={styles.paragraph}>
              We may share your information with:
            </Text>
            <Text style={styles.bulletPoint}>• City Health Office personnel for application processing</Text>
            <Text style={styles.bulletPoint}>• Barangay Health Centers for over-the-counter payments and verification</Text>
            <Text style={styles.bulletPoint}>• Sangguniang Panlungsod ng Dabaw for over-the-counter payments</Text>
            <Text style={styles.bulletPoint}>• Authorized medical professionals conducting examinations</Text>
            <Text style={styles.bulletPoint}>• Payment processing partners (Maya for digital payments)</Text>
            <Text style={styles.bulletPoint}>• Government agencies as required by law</Text>
            <Text style={styles.bulletPoint}>• Employers (only health card status and validity via QR code)</Text>
            <Text style={styles.paragraph}>
              We do not sell, rent, or share your personal data with third parties for marketing purposes.
            </Text>

            <Text style={styles.sectionTitle}>6. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard security measures to protect your data:
            </Text>
            <Text style={styles.bulletPoint}>• End-to-end encryption for sensitive information</Text>
            <Text style={styles.bulletPoint}>• Secure cloud storage with access controls</Text>
            <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
            <Text style={styles.bulletPoint}>• Secure authentication through Clerk</Text>
            <Text style={styles.bulletPoint}>• Encrypted payment processing</Text>
            <Text style={styles.bulletPoint}>• Limited access to authorized personnel only</Text>

            <Text style={styles.sectionTitle}>7. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your information for the following periods:
            </Text>
            <Text style={styles.bulletPoint}>• Active health cards: Duration of validity plus 5 years</Text>
            <Text style={styles.bulletPoint}>• Expired health cards: 5 years from expiration</Text>
            <Text style={styles.bulletPoint}>• Rejected applications: 2 years from rejection date</Text>
            <Text style={styles.bulletPoint}>• Payment records (including failed/cancelled): 7 years as required by law</Text>
            <Text style={styles.bulletPoint}>• Renewal applications: Treated as new applications with same retention periods</Text>
            <Text style={styles.bulletPoint}>• Account data: Until account deletion request</Text>
            <Text style={styles.paragraph}>
              Note: Payment records for rejected applications are retained for audit purposes, but payments are non-refundable except in cases of CHO administrative or technical errors.
            </Text>

            <Text style={styles.sectionTitle}>8. Your Rights</Text>
            <Text style={styles.paragraph}>
              Under the Data Privacy Act, you have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal and health information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate or incomplete data</Text>
            <Text style={styles.bulletPoint}>• Object to processing in certain circumstances</Text>
            <Text style={styles.bulletPoint}>• Request erasure or deletion of your account and data</Text>
            <Text style={styles.bulletPoint}>• Request data portability</Text>
            <Text style={styles.bulletPoint}>• Withdraw consent for non-essential processing</Text>
            <Text style={styles.bulletPoint}>• Manage push notification preferences</Text>
            <Text style={styles.bulletPoint}>• Lodge complaints with the National Privacy Commission</Text>
            <Text style={styles.paragraph}>
              Note: Certain rights may be limited by legal obligations to maintain health records for regulatory compliance. Payment records cannot be deleted due to audit requirements.
            </Text>

            <Text style={styles.sectionTitle}>9. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              The application uses:
            </Text>
            <Text style={styles.bulletPoint}>• Essential cookies for authentication and security</Text>
            <Text style={styles.bulletPoint}>• Analytics to improve application performance</Text>
            <Text style={styles.bulletPoint}>• Session management for seamless user experience</Text>
            <Text style={styles.paragraph}>
              You can manage cookie preferences in your device settings, but this may affect application functionality.
            </Text>

            <Text style={styles.sectionTitle}>10. Payment and Refund Policy</Text>
            <Text style={styles.paragraph}>
              Regarding payment data and refund policies:
            </Text>
            <Text style={styles.bulletPoint}>• All payment transactions are securely processed and recorded</Text>
            <Text style={styles.bulletPoint}>• Digital payments via Maya and over-the-counter payments are both supported</Text>
            <Text style={styles.bulletPoint}>• Payment data is retained for 7 years as required by law</Text>
            <Text style={styles.bulletPoint}>• Payments are non-refundable if applications are rejected due to incomplete documents, failed medical examinations, or applicant-related issues</Text>
            <Text style={styles.bulletPoint}>• Refunds are only provided for CHO administrative or technical errors</Text>
            <Text style={styles.bulletPoint}>• All refund requests are reviewed on a case-by-case basis</Text>

            <Text style={styles.sectionTitle}>11. Children&apos;s Privacy</Text>
            <Text style={styles.paragraph}>
              Minors (below 18 years) may use this application only with parental consent. Parents or guardians are responsible for monitoring their minor&apos;s use of the application and providing accurate information.
            </Text>

            <Text style={styles.sectionTitle}>12. Changes to Privacy Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy periodically. Significant changes will be communicated through push notifications, in-app announcements, or via email. Your continued use after changes indicates acceptance of the updated policy.
            </Text>

            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.paragraph}>
              For privacy concerns or to exercise your data rights, contact:
            </Text>
            <Text style={styles.bulletPoint}>• Data Protection Officer</Text>
            <Text style={styles.bulletPoint}>• City Health Office, Davao City</Text>
            <Text style={styles.bulletPoint}>• Email: cho@davaocity.gov.ph</Text>
            <Text style={styles.bulletPoint}>• Phone: 0926-686-1531 / 0999-938-0540</Text>
            <Text style={styles.bulletPoint}>• Address: Door 7, Magsaysay Park Complex, Ramon Magsaysay Avenue, Barangay 23-C (Poblacion), Davao City</Text>

            <Text style={styles.sectionTitle}>14. Complaints</Text>
            <Text style={styles.paragraph}>
              If you believe your privacy rights have been violated, you may file a complaint with:
            </Text>
            <Text style={styles.bulletPoint}>• National Privacy Commission</Text>
            <Text style={styles.bulletPoint}>• 5th Floor, Philippine International Convention Center (PICC)</Text>
            <Text style={styles.bulletPoint}>• Vicente Sotto Street, Pasay City, Metro Manila 1300</Text>
            <Text style={styles.bulletPoint}>• Email: info@privacy.gov.ph</Text>
            <Text style={styles.bulletPoint}>• Hotline: (+63 2) 8234-2228</Text>
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
  subSectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(6),
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
