import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@shared/styles/theme';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I log in to my account?',
    answer: 'Use the email and password provided by your administrator. If this is your first time logging in, you will be prompted to change your password.',
  },
  {
    category: 'Getting Started',
    question: 'What is my role as an inspector?',
    answer: 'As an inspector, you conduct food safety orientations and verify attendee attendance by scanning their QR codes during check-in and check-out.',
  },
  // QR Code Scanning
  {
    category: 'QR Code Scanning',
    question: 'How do I scan attendee QR codes?',
    answer: 'Tap the purple QR button at the bottom of your screen. Allow camera access if prompted. Point your camera at the attendee\'s QR code and it will scan automatically.',
  },
  {
    category: 'QR Code Scanning',
    question: 'What to do if QR code won\'t scan?',
    answer: 'Ensure good lighting and that the QR code is not blurry. Ask the attendee to increase screen brightness. Clean your camera lens. Check your internet connection.',
  },
  {
    category: 'QR Code Scanning',
    question: 'What does check-in vs check-out mean?',
    answer: 'Check-in: Scan when attendee arrives at the orientation. Check-out: Scan when attendee completes and leaves the orientation. Both scans are required.',
  },
  // Managing Sessions
  {
    category: 'Managing Sessions',
    question: 'How do I view my assigned sessions?',
    answer: 'Go to the Sessions tab from the bottom navigation. You\'ll see all your scheduled orientation sessions organized by date.',
  },
  {
    category: 'Managing Sessions',
    question: 'What if someone is not on the attendee list?',
    answer: 'Contact your administrator immediately. Do not manually add attendees. Only scan QR codes of registered participants.',
  },
  {
    category: 'Managing Sessions',
    question: 'How do I handle late arrivals?',
    answer: 'Scan their QR code for check-in when they arrive. The system records the timestamp automatically. Note: Very late arrivals may be counted as missed.',
  },
  // Attendance Tracking
  {
    category: 'Attendance Tracking',
    question: 'What if someone forgets to check out?',
    answer: 'Remind attendees to scan again when leaving. If they already left, contact your administrator who can manually update the attendance status.',
  },
  {
    category: 'Attendance Tracking',
    question: 'How do I view attendance for a session?',
    answer: 'From your current or upcoming session card, tap "View Attendees" to see the full list with their check-in/check-out status.',
  },
  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'Camera not working - what should I do?',
    answer: 'Go to your phone Settings > Apps > eMediCard > Permissions. Ensure Camera permission is enabled. If still not working, restart the app.',
  },
  {
    category: 'Troubleshooting',
    question: 'App is slow or not responding',
    answer: 'Check your internet connection. Close and reopen the app. If problem persists, contact technical support.',
  },
  {
    category: 'Troubleshooting',
    question: 'Can\'t see my assigned sessions',
    answer: 'Make sure you\'re connected to the internet. Pull down to refresh. If still not showing, contact your administrator.',
  },
  // Account & Security
  {
    category: 'Account & Security',
    question: 'How do I change my password?',
    answer: 'Go to Settings tab > Security > Change Password. Enter your current password and new password twice to confirm.',
  },
  {
    category: 'Account & Security',
    question: 'I forgot my password, what should I do?',
    answer: 'Contact your administrator to reset your password. They will provide you with a new temporary password.',
  },
  {
    category: 'Account & Security',
    question: 'Can I change my email or name?',
    answer: 'No, your account information is managed by the administrator. Contact them if your details need to be updated.',
  },
];

const CATEGORIES = [
  { icon: 'rocket-outline', title: 'Getting Started', color: theme.colors.primary[500] },
  { icon: 'qr-code-outline', title: 'QR Code Scanning', color: theme.colors.purple[500] },
  { icon: 'calendar-outline', title: 'Managing Sessions', color: theme.colors.blue[500] },
  { icon: 'checkmark-circle-outline', title: 'Attendance Tracking', color: theme.colors.semantic.success },
  { icon: 'build-outline', title: 'Troubleshooting', color: theme.colors.semantic.warning },
  { icon: 'lock-closed-outline', title: 'Account & Security', color: theme.colors.semantic.error },
];

export function InspectorHelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('tel:09171234567');
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={HEADER_CONSTANTS.ICON_SIZE}
              color={HEADER_CONSTANTS.WHITE}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Help Center</Text>
            <Text style={styles.subtitle}>Find answers and get support</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={moderateScale(20)}
            color={theme.colors.text.tertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={moderateScale(20)}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        {!searchQuery && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>BROWSE BY TOPIC</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.title}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.title && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category.title)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={moderateScale(16)}
                    color={
                      selectedCategory === category.title
                        ? theme.colors.primary[500]
                        : theme.colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.title && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery
              ? `${filteredFAQs.length} RESULT${filteredFAQs.length !== 1 ? 'S' : ''}`
              : selectedCategory
              ? selectedCategory.toUpperCase()
              : 'FREQUENTLY ASKED QUESTIONS'}
          </Text>

          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={moderateScale(64)}
                color={theme.colors.text.tertiary}
              />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try different keywords</Text>
            </View>
          ) : (
            filteredFAQs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedItems.includes(index) ? 'chevron-up' : 'chevron-down'}
                    size={moderateScale(20)}
                    color={theme.colors.text.secondary}
                  />
                </View>
                {expandedItems.includes(index) && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            Contact our support team for assistance
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={moderateScale(20)} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: scale(12),
    padding: moderateScale(4),
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
    marginBottom: verticalScale(2),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(100),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: theme.colors.text.primary,
    paddingVertical: verticalScale(14),
  },
  clearButton: {
    padding: moderateScale(4),
  },
  categoriesSection: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  categoriesScroll: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    gap: scale(6),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: `${theme.colors.primary[500]}15`,
    borderColor: theme.colors.primary[500],
  },
  categoryChipText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  categoryChipTextActive: {
    color: theme.colors.primary[500],
    fontWeight: '600',
  },
  faqSection: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(16),
  },
  faqItem: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: scale(8),
  },
  faqAnswer: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(12),
    lineHeight: moderateScale(20),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(48),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
  },
  contactSection: {
    marginHorizontal: scale(16),
    marginTop: verticalScale(32),
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
  },
  contactText: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: verticalScale(16),
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  contactButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
