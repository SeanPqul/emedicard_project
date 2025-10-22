import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * HelpCenterScreen
 * 
 * Comprehensive help and support screen with FAQs, requirements,
 * venue information, and contact details for Davao City Health Card.
 */
export function HelpCenterScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCallCHO = () => {
    Linking.openURL('tel:09266861531');
  };

  const handleEmailCHO = () => {
    Linking.openURL('mailto:cho@davaocity.gov.ph');
  };

  const faqs: FAQItem[] = [
    {
      id: 'what-is-health-card',
      question: 'What is the Health Card?',
      answer: 'The Davao City Health Card is a mandatory work requirement for individuals who handle food. It is processed by the City Health Office (CHO) and released by sanitary inspectors to ensure compliance with health and safety standards.',
    },
    {
      id: 'who-needs',
      question: 'Who needs a Health Card?',
      answer: 'All employees in Davao City whose work requires health certification, including those in food service, retail, hospitality, personal care, and other regulated industries.',
    },
    {
      id: 'requirements',
      question: 'What are the requirements?',
      answer: 'Valid Community Tax Certificate (cedula) with Official Receipt and complete laboratory results from any accredited Davao City laboratory.\n\nSpecial cases:\n• Minors: parental consent required\n• Pregnant applicants: prenatal record and sputum AFB\n• Security guards: drug test and neuro-psychiatric test\n• Pink card applicants: Hepatitis B antibody test',
    },
    {
      id: 'how-to-apply',
      question: 'How do I apply?',
      answer: '1. Complete your application in the eMediCard app\n2. Upload required documents and pay application fee\n3. Attend food handling orientation (for food handlers)\n4. Visit CHO venue for medical examination\n5. Receive your digital health card in the app',
    },
    {
      id: 'fees',
      question: 'What are the fees?',
      answer: 'The total application fee is ₱60.00, which includes a ₱50.00 application fee and a ₱10.00 processing fee.',
    },
    {
      id: 'compliance',
      question: 'Why is compliance important?',
      answer: 'CHO conducts regular sanitary inspections by district. Establishments must keep staff health cards current. Non-compliance during inspections can affect permits and business operations.',
    },
    {
      id: 'legal-basis',
      question: 'What is the legal basis?',
      answer: 'Republic Act No. 10611 (Food Safety Act of 2013) mandates food safety responsibilities.\n\nPresidential Decree No. 856 (Sanitation Code of the Philippines) provides national sanitation requirements that LGUs implement via permits and health certification.',
    },
  ];

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[theme.colors.indigo[500], theme.colors.indigo[600]]}
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
              <Ionicons name="help-circle" size={moderateScale(32)} color={theme.colors.ui.white} />
            </View>
            
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>Everything you need to know</Text>
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
          {/* Quick Links */}
          <View style={styles.quickLinksContainer}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.quickLinks}>
              <Pressable 
                style={({ pressed }) => [
                  styles.quickLinkCard,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={() => router.push('/(screens)/(shared)/documents/requirements')}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: theme.colors.blue[50] }]}>
                  <Ionicons name="list" size={moderateScale(24)} color={theme.colors.blue[600]} />
                </View>
                <Text style={styles.quickLinkText}>Requirements</Text>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.quickLinkCard,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={() => router.push('/(screens)/(shared)/orientation/food-safety-info')}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: theme.colors.orange[50] }]}>
                  <Ionicons name="restaurant" size={moderateScale(24)} color={theme.colors.orange[600]} />
                </View>
                <Text style={styles.quickLinkText}>Food Safety</Text>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.quickLinkCard,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={handleCallCHO}
              >
                <View style={[styles.quickLinkIcon, { backgroundColor: theme.colors.green[50] }]}>
                  <Ionicons name="call" size={moderateScale(24)} color={theme.colors.green[600]} />
                </View>
                <Text style={styles.quickLinkText}>Call CHO</Text>
              </Pressable>
            </View>
          </View>

          {/* Venue Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={moderateScale(24)} color={theme.colors.red[500]} />
              <Text style={styles.cardTitle}>Current Venue & Hours</Text>
            </View>
            <Text style={styles.venueTitle}>City Health Office, Magsaysay Park Complex</Text>
            <Text style={styles.venueAddress}>
              Door 7, Magsaysay Park Complex, Ramon Magsaysay Avenue,{'\n'}
              Barangay 23-C (Poblacion), Davao City
            </Text>
            <View style={styles.venueHours}>
              <View style={styles.venueHourItem}>
                <Ionicons name="calendar" size={moderateScale(16)} color={theme.colors.gray[600]} />
                <Text style={styles.venueHourText}>Monday to Friday</Text>
              </View>
              <View style={styles.venueHourItem}>
                <Ionicons name="time" size={moderateScale(16)} color={theme.colors.gray[600]} />
                <Text style={styles.venueHourText}>8:00 AM–5:00 PM</Text>
              </View>
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.faqContainer}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq) => (
              <Pressable
                key={faq.id}
                style={styles.faqCard}
                onPress={() => toggleFAQ(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons 
                    name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'} 
                    size={moderateScale(20)} 
                    color={theme.colors.gray[400]} 
                  />
                </View>
                {expandedId === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Contact Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={moderateScale(24)} color={theme.colors.blue[600]} />
              <Text style={styles.cardTitle}>Need More Help?</Text>
            </View>
            <Text style={styles.contactDescription}>
              Contact the City Health Office for real-time updates and specific inquiries
            </Text>
            
            <Pressable 
              style={({ pressed }) => [
                styles.contactButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleCallCHO}
            >
              <Ionicons name="call" size={moderateScale(20)} color={theme.colors.blue[600]} />
              <View style={styles.contactButtonContent}>
                <Text style={styles.contactButtonLabel}>Phone</Text>
                <Text style={styles.contactButtonValue}>0926-686-1531 / 0999-938-0540</Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.gray[400]} />
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.contactButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleEmailCHO}
            >
              <Ionicons name="mail" size={moderateScale(20)} color={theme.colors.blue[600]} />
              <View style={styles.contactButtonContent}>
                <Text style={styles.contactButtonLabel}>Email</Text>
                <Text style={styles.contactButtonValue}>cho@davaocity.gov.ph</Text>
              </View>
              <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.gray[400]} />
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
  headerContainer: {
    position: 'relative',
  },
  header: {
    paddingTop: verticalScale(44),
    paddingBottom: verticalScale(20),
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
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
  },
  quickLinksContainer: {
    marginBottom: verticalScale(24),
  },
  quickLinks: {
    flexDirection: 'row',
    gap: scale(12),
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  quickLinkText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
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
    flex: 1,
  },
  venueTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  venueAddress: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
  },
  venueHours: {
    gap: verticalScale(8),
  },
  venueHourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  venueHourText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  faqContainer: {
    marginBottom: verticalScale(16),
  },
  faqCard: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  faqIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  faqAnswer: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(12),
  },
  contactDescription: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(8),
    gap: scale(12),
  },
  contactButtonContent: {
    flex: 1,
  },
  contactButtonLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    marginBottom: verticalScale(2),
  },
  contactButtonValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  bottomSpacer: {
    height: verticalScale(16),
  },
});
