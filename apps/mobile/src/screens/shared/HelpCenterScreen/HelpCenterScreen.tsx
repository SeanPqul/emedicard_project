import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { usePricing } from '@/src/features/payment/hooks/usePricing';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const [contactSectionY, setContactSectionY] = useState<number>(0);
  const params = useLocalSearchParams();
  const { baseFee, serviceFee, totalFee } = usePricing();

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Auto-scroll to contact section when coming from "Contact support"
  useEffect(() => {
    if (params.scrollToContact === 'true' && contactSectionY > 0) {
      // Delay to ensure layout is complete, then animate smoothly
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: contactSectionY - verticalScale(80), // Offset to show section with some spacing
          animated: true,
        });
      }, 600); // Increased delay for smoother transition

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [params.scrollToContact, contactSectionY]);

  const handleContactSectionLayout = (event: any) => {
    const { y } = event.nativeEvent.layout;
    setContactSectionY(y);
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
      answer: `The Davao City Health Card is an official certificate from the City Health Office confirming you've completed required medical screening and are cleared to work in regulated jobs and establishments across the city.\n\nIt enables employer compliance during sanitary inspections and follows national sanitation rules; validity and required tests vary by occupation, and certain job titles include extra steps before release.`
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
      answer: `The total application fee is ₱${totalFee}.00, which includes a ₱${baseFee}.00 application fee and a ₱${serviceFee}.00 processing fee.`,
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
        <ScrollView
          ref={scrollViewRef}
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
              <Text style={styles.pageTitle}>Help Center</Text>
              <Text style={styles.pageSubtitle}>Everything you need to know</Text>
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
          <View onLayout={handleContactSectionLayout} style={styles.card}>
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
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(16),
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
    paddingHorizontal: scale(16),
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
