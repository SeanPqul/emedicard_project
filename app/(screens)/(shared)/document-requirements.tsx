import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { api } from '../../../convex/_generated/api';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../../src/styles/theme';

interface Requirement {
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
}

interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation: string;
}

export default function DocumentRequirements() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const jobCategories = useQuery(api.jobCategories.getAllJobCategories);
  const requirementsByCategory = useQuery(
    api.requirements.getRequirementsByJobCategory,
    selectedCategoryId ? { jobCategoryId: selectedCategoryId as any } : "skip"
  );
  const seedDatabase = useMutation(api.seedData.seedJobCategoriesAndRequirements);

  // Auto-seed database if empty
  useEffect(() => {
    const autoSeed = async () => {
      if (jobCategories !== undefined && jobCategories.length === 0 && !isSeeding) {
        setIsSeeding(true);
        try {
          await seedDatabase();
          console.log('Database auto-seeded successfully');
        } catch (error) {
          console.error('Auto-seed failed:', error);
        } finally {
          setIsSeeding(false);
        }
      }
    };

    autoSeed();
  }, [jobCategories, isSeeding]);

  const handleCategorySelect = (categoryId: string) => {
    // Toggle collapse/expand
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null); // Collapse if already selected
    } else {
      setSelectedCategoryId(categoryId); // Expand if not selected
    }
  };

  const getHealthCardTypeName = (category: JobCategory) => {
    const colorMap: { [key: string]: string } = {
      '#FFD700': 'Yellow Card',
      '#FFFF00': 'Yellow Card',
      '#008000': 'Green Card',
      '#00FF00': 'Green Card',
      '#FF69B4': 'Pink Card',
      '#FFC0CB': 'Pink Card',
    };
    
    return colorMap[category.colorCode] || `${category.name} Card`;
  };

  const getPaymentMethods = (category: JobCategory) => {
    // All health card types use the same payment methods
    return [
      { method: 'GCash', description: 'Mobile payment via GCash' },
      { method: 'Maya', description: 'Mobile payment via Maya (PayMaya)' },
      { method: 'Barangay Hall', description: 'Pay at Barangay Hall (Cash/OR)' },
      { method: 'City Hall (Sangunian)', description: 'Pay at City Hall Sangunian Office (Cash/OR)' }
    ];
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Requirements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 How to Use</Text>
          <Text style={styles.instructionsText}>
            Select a health card type below to view the required documents and payment options for your application.
          </Text>
        </View>

        {/* Health Card Type Selection */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Select Health Card Type</Text>
          
          {jobCategories?.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                selectedCategoryId === category._id && styles.selectedCategoryCard,
                { borderLeftColor: category.colorCode }
              ]}
              onPress={() => handleCategorySelect(category._id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: category.colorCode }]} />
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.cardType}>{getHealthCardTypeName(category)}</Text>
                  {category.requireOrientation === 'Yes' && (
                    <View style={styles.orientationBadge}>
                      <Ionicons name="school-outline" size={12} color={getColor('accent.medicalBlue')} />
                      <Text style={styles.orientationText}>Orientation Required</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons 
                name={selectedCategoryId === category._id ? "chevron-up" : "chevron-down"} 
                size={20} 
color={getColor('text.secondary')}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Requirements Display */}
        {selectedCategoryId && requirementsByCategory && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.sectionTitle}>
              Required Documents for {getHealthCardTypeName(requirementsByCategory.jobCategory)}
            </Text>
            
            <View style={styles.requirementsSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="document-text" size={20} color={getColor('accent.medicalBlue')} />
                <Text style={styles.summaryText}>
                  {requirementsByCategory.totalRequirements} Documents Required
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="cash" size={20} color={getColor('accent.safetyGreen')} />
                <Text style={styles.summaryText}>
                  Application Fee: ₱60
                </Text>
              </View>
            </View>

            {/* Document List */}
            <View style={styles.documentsList}>
              {requirementsByCategory.requirements.map((requirement: Requirement, index: number) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.requirementIcon}>
                    <Ionicons 
                      name={requirement.icon as any} 
                      size={28} 
                      color={getColor('accent.medicalBlue')}
                    />
                  </View>
                  <View style={styles.requirementDetails}>
                    <Text style={styles.requirementName}>{requirement.name}</Text>
                    <Text style={styles.requirementDescription}>{requirement.description}</Text>
                    {requirement.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Options */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>💳 Payment Options</Text>
              {getPaymentMethods(requirementsByCategory.jobCategory).map((payment, index) => (
                <View key={index} style={styles.paymentOption}>
                  <View style={styles.paymentIcon}>
                    <Ionicons 
                      name={
                        payment.method.includes('GCash') ? 'phone-portrait' :
                        payment.method.includes('Maya') ? 'phone-portrait' :
                        'business'
                      } 
                      size={24} 
                      color={getColor('accent.safetyGreen')}
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                    <Text style={styles.paymentDescription}>{payment.description}</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={16} color={getColor('text.secondary')} />
                <Text style={styles.paymentNoteText}>
                  For Barangay Hall or City Hall payments, you&apos;ll need to upload your Official Receipt (OR) during the application process.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/(tabs)/apply')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Start Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(tabs)/application')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>View My Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading/Seeding State */}
        {isSeeding && (
          <View style={styles.loadingState}>
            <Ionicons name="sync-outline" size={64} color={getColor('primary.main')} />
            <Text style={styles.loadingTitle}>Setting up database...</Text>
            <Text style={styles.loadingDescription}>
              Initializing health card categories and requirements. This will only take a moment.
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!selectedCategoryId && !isSeeding && jobCategories && jobCategories.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={getColor('text.secondary')} />
            <Text style={styles.emptyTitle}>Select a Health Card Type</Text>
            <Text style={styles.emptyDescription}>
              Choose from the available health card types above to view the specific document requirements.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
    ...getShadow('small'),
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('background.secondary'),
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadow('small'),
  },
  headerTitle: {
    flex: 1,
    ...getTypography('h3'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginHorizontal: getSpacing('md'),
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  instructionsContainer: {
    margin: getSpacing('lg'),
    padding: getSpacing('lg'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    borderLeftWidth: 5,
    borderLeftColor: getColor('accent.medicalBlue'),
    ...getShadow('medium'),
  },
  instructionsTitle: {
    ...getTypography('h4'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  instructionsText: {
    ...getTypography('bodyMedium'),
    color: getColor('text.secondary'),
    lineHeight: 22,
  },
  categoryContainer: {
    paddingHorizontal: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
  },
  sectionTitle: {
    ...getTypography('h3'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('lg'),
  },
  categoryCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...getShadow('medium'),
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  selectedCategoryCard: {
    borderColor: getColor('accent.medicalBlue'),
    borderWidth: 2,
    ...getShadow('large'),
    transform: [{ scale: 1.02 }],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('md'),
    borderWidth: 2,
    borderColor: getColor('background.primary'),
    ...getShadow('small'),
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...getTypography('bodyLarge'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  cardType: {
    ...getTypography('bodyMedium'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
    marginBottom: getSpacing('xs'),
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orientationText: {
    ...getTypography('caption'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
    marginLeft: getSpacing('xs'),
  },
  requirementsContainer: {
    paddingHorizontal: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
  },
  requirementsSummary: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
    ...getShadow('medium'),
    borderWidth: 1,
    borderColor: getColor('accent.safetyGreen'),
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
  },
  summaryText: {
    ...getTypography('bodyMedium'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginLeft: getSpacing('sm'),
  },
  documentsList: {
    marginBottom: getSpacing('lg'),
  },
  requirementItem: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...getShadow('medium'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('background.secondary'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
    borderWidth: 2,
    borderColor: getColor('accent.medicalBlue'),
  },
  requirementDetails: {
    flex: 1,
  },
  requirementName: {
    ...getTypography('bodyLarge'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  requirementDescription: {
    ...getTypography('bodyMedium'),
    color: getColor('text.secondary'),
    lineHeight: 20,
    marginBottom: getSpacing('sm'),
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: getColor('semantic.error'),
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('full'),
    ...getShadow('small'),
  },
  requiredText: {
    ...getTypography('caption'),
    color: getColor('text.inverse'),
    fontWeight: '700',
    fontSize: 10,
  },
  paymentContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
    ...getShadow('medium'),
    borderWidth: 1,
    borderColor: getColor('border.light'),
  },
  paymentTitle: {
    ...getTypography('h4'),
    fontWeight: '700',
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
    borderRadius: getBorderRadius('md'),
    marginBottom: getSpacing('xs'),
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('background.secondary'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
    borderWidth: 2,
    borderColor: getColor('accent.safetyGreen'),
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMethod: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    fontWeight: '700',
    marginBottom: 2,
  },
  paymentDescription: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: getSpacing('md'),
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('lg'),
    borderWidth: 1,
    borderColor: getColor('accent.warningOrange'),
  },
  paymentNoteText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.warningOrange'),
    marginLeft: getSpacing('sm'),
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    marginBottom: getSpacing('xl'),
  },
  primaryButton: {
    backgroundColor: getColor('accent.medicalBlue'),
    borderRadius: getBorderRadius('xl'),
    paddingVertical: getSpacing('lg'),
    alignItems: 'center',
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  primaryButtonText: {
    ...getTypography('bodyLarge'),
    fontWeight: '700',
    color: getColor('text.inverse'),
  },
  secondaryButton: {
    backgroundColor: getColor('background.primary'),
    borderWidth: 2,
    borderColor: getColor('accent.medicalBlue'),
    borderRadius: getBorderRadius('xl'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
    ...getShadow('medium'),
  },
  secondaryButtonText: {
    ...getTypography('bodyLarge'),
    fontWeight: '600',
    color: getColor('accent.medicalBlue'),
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: getSpacing('xxxl'),
    paddingHorizontal: getSpacing('xl'),
  },
  loadingTitle: {
    ...getTypography('h3'),
    color: getColor('primary.main'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  loadingDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing('xxxl'),
    paddingHorizontal: getSpacing('xl'),
  },
  emptyTitle: {
    ...getTypography('h3'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  emptyDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
});
