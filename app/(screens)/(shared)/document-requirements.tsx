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
        >
          <Ionicons name="arrow-back" size={24} color={getColor('textPrimary')} />
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
            >
              <View style={styles.categoryInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: category.colorCode }]} />
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.cardType}>{getHealthCardTypeName(category)}</Text>
                  {category.requireOrientation === 'Yes' && (
                    <View style={styles.orientationBadge}>
                      <Ionicons name="school-outline" size={12} color={getColor('primaryMain')} />
                      <Text style={styles.orientationText}>Orientation Required</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons 
                name={selectedCategoryId === category._id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={getColor('textSecondary')}
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
                <Ionicons name="document-text-outline" size={16} color={getColor('primaryMain')} />
                <Text style={styles.summaryText}>
                  {requirementsByCategory.totalRequirements} Documents Required
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="card-outline" size={16} color={getColor('warningMain')} />
                <Text style={styles.summaryText}>
                  Fee: ₱60
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
                      size={24} 
                      color={getColor('primaryMain')}
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
                        payment.method.includes('GCash') ? 'phone-portrait-outline' :
                        payment.method.includes('Maya') ? 'phone-portrait-outline' :
                        'business-outline'
                      } 
                      size={20} 
                      color={getColor('successMain')}
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                    <Text style={styles.paymentDescription}>{payment.description}</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={16} color={getColor('textSecondary')} />
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
              >
                <Text style={styles.primaryButtonText}>Start Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(tabs)/application')}
              >
                <Text style={styles.secondaryButtonText}>View My Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading/Seeding State */}
        {isSeeding && (
          <View style={styles.loadingState}>
            <Ionicons name="sync-outline" size={64} color={getColor('primaryMain')} />
            <Text style={styles.loadingTitle}>Setting up database...</Text>
            <Text style={styles.loadingDescription}>
              Initializing health card categories and requirements. This will only take a moment.
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!selectedCategoryId && !isSeeding && jobCategories && jobCategories.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={getColor('textSecondary')} />
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
    backgroundColor: getColor('backgroundSecondary'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('backgroundPrimary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('borderLight'),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('backgroundSecondary'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    ...getTypography('h3'),
    color: getColor('textPrimary'),
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
    padding: getSpacing('md'),
    backgroundColor: getColor('primaryLight'),
    borderRadius: getBorderRadius('lg'),
    borderLeftWidth: 4,
    borderLeftColor: getColor('primaryMain'),
  },
  instructionsTitle: {
    ...getTypography('bodyLarge'),
    color: getColor('textPrimary'),
    marginBottom: getSpacing('xs'),
  },
  instructionsText: {
    ...getTypography('body'),
    color: getColor('textSecondary'),
    lineHeight: 20,
  },
  categoryContainer: {
    paddingHorizontal: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
  },
  sectionTitle: {
    ...getTypography('h3'),
    color: getColor('textPrimary'),
    marginBottom: getSpacing('md'),
  },
  categoryCard: {
    backgroundColor: getColor('backgroundPrimary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...getShadow('sm'),
    borderLeftWidth: 4,
  },
  selectedCategoryCard: {
    borderColor: getColor('primaryMain'),
    borderWidth: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: getBorderRadius('full'),
    marginRight: getSpacing('sm'),
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    ...getTypography('bodyLarge'),
    color: getColor('textPrimary'),
    marginBottom: getSpacing('xxs'),
  },
  cardType: {
    ...getTypography('body'),
    color: getColor('textSecondary'),
    marginBottom: getSpacing('xxs'),
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orientationText: {
    ...getTypography('caption'),
    color: getColor('primaryMain'),
    marginLeft: getSpacing('xxs'),
  },
  requirementsContainer: {
    paddingHorizontal: getSpacing('lg'),
    marginBottom: getSpacing('lg'),
  },
  requirementsSummary: {
    backgroundColor: getColor('backgroundPrimary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    ...getShadow('sm'),
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  summaryText: {
    ...getTypography('body'),
    color: getColor('textPrimary'),
    marginLeft: getSpacing('xs'),
  },
  documentsList: {
    marginBottom: getSpacing('lg'),
  },
  requirementItem: {
    backgroundColor: getColor('backgroundPrimary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...getShadow('sm'),
  },
  requirementIcon: {
    width: 40,
    height: 40,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('primaryLight'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
  },
  requirementDetails: {
    flex: 1,
  },
  requirementName: {
    ...getTypography('bodyLarge'),
    color: getColor('textPrimary'),
    marginBottom: getSpacing('xxs'),
  },
  requirementDescription: {
    ...getTypography('body'),
    color: getColor('textSecondary'),
    lineHeight: 18,
    marginBottom: getSpacing('xs'),
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: getColor('successLight'),
    paddingHorizontal: getSpacing('xs'),
    paddingVertical: getSpacing('xxs'),
    borderRadius: getBorderRadius('xs'),
  },
  requiredText: {
    ...getTypography('caption'),
    color: getColor('successMain'),
    fontWeight: '500',
  },
  paymentContainer: {
    backgroundColor: getColor('backgroundPrimary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('lg'),
    ...getShadow('sm'),
  },
  paymentTitle: {
    ...getTypography('bodyLarge'),
    color: getColor('textPrimary'),
    marginBottom: getSpacing('sm'),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('backgroundSecondary'),
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('successLight'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('sm'),
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMethod: {
    ...getTypography('body'),
    color: getColor('textPrimary'),
    fontWeight: '600',
  },
  paymentDescription: {
    ...getTypography('caption'),
    color: getColor('textSecondary'),
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: getSpacing('sm'),
    padding: getSpacing('sm'),
    backgroundColor: getColor('warningLight'),
    borderRadius: getBorderRadius('sm'),
  },
  paymentNoteText: {
    ...getTypography('caption'),
    color: getColor('warningDark'),
    marginLeft: getSpacing('xs'),
    flex: 1,
    lineHeight: 16,
  },
  actionButtons: {
    marginBottom: getSpacing('xl'),
  },
  primaryButton: {
    backgroundColor: getColor('primaryMain'),
    borderRadius: getBorderRadius('sm'),
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  primaryButtonText: {
    ...getTypography('buttonPrimary'),
    color: getColor('textWhite'),
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: getColor('primaryMain'),
    borderRadius: getBorderRadius('sm'),
    paddingVertical: getSpacing('sm'),
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...getTypography('buttonSecondary'),
    color: getColor('primaryMain'),
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: getSpacing('3xl'),
    paddingHorizontal: getSpacing('xl'),
  },
  loadingTitle: {
    ...getTypography('h3'),
    color: getColor('primaryMain'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  loadingDescription: {
    ...getTypography('body'),
    color: getColor('textSecondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing('3xl'),
    paddingHorizontal: getSpacing('xl'),
  },
  emptyTitle: {
    ...getTypography('h3'),
    color: getColor('textSecondary'),
    marginTop: getSpacing('md'),
    marginBottom: getSpacing('xs'),
  },
  emptyDescription: {
    ...getTypography('body'),
    color: getColor('textSecondary'),
    textAlign: 'center',
    lineHeight: 20,
  },
});
