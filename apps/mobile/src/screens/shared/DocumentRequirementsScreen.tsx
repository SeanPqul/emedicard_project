import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getColor } from '@shared/styles/theme';
import { styles } from '@shared/styles/screens/shared-document-requirements';
import { JobCategory } from '@/src/entities/application/model/types';
import { useJobCategories } from '@entities/jobCategory';
import { getHealthCardTypeName, getPaymentMethods } from '@features/healthCards/lib';

interface Requirement {
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
}

export function DocumentRequirementsScreen() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const {
    jobCategories,
    requirementsByCategory
  } = useJobCategories(selectedCategoryId || undefined);

  const handleCategorySelect = (categoryId: string) => {
    // Toggle collapse/expand
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null); // Collapse if already selected
    } else {
      setSelectedCategoryId(categoryId); // Expand if not selected
    }
  };


  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
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
          
          {jobCategories?.map((category: JobCategory) => (
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
                  <Text style={styles.cardType}>{getHealthCardTypeName(category.name)}</Text>
                  {(category.requireOrientation === 'Yes' || category.requireOrientation === true) && (
                    <View style={styles.orientationBadge}>
                      <Ionicons name="school-outline" size={12} color={getColor('primary.main')} />
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
                <Ionicons name="document-text-outline" size={16} color={getColor('primary.main')} />
                <Text style={styles.summaryText}>
                  {requirementsByCategory.totalRequirements} Documents Required
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="card-outline" size={16} color={getColor('warning.main')} />
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
                      color={getColor('primary.main')}
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
                      color={getColor('success.main')}
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
                  For Barangay Hall or City Hall payments, you'll need to upload your Official Receipt (OR) during the application process.
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


        {/* Empty State */}
        {!selectedCategoryId && jobCategories && jobCategories.length > 0 && (
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