import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  
  const jobCategories = useQuery(api.jobCategories.getAllJobCategories);
  const requirementsByCategory = useQuery(
    api.requirements.getRequirementsByJobCategory,
    selectedCategoryId ? { jobCategoryId: selectedCategoryId as any } : "skip"
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#212529" />
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
                      <Ionicons name="school-outline" size={12} color="#2E86AB" />
                      <Text style={styles.orientationText}>Orientation Required</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons 
                name={selectedCategoryId === category._id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6C757D" 
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
                <Ionicons name="document-text-outline" size={16} color="#2E86AB" />
                <Text style={styles.summaryText}>
                  {requirementsByCategory.totalRequirements} Documents Required
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="card-outline" size={16} color="#F18F01" />
                <Text style={styles.summaryText}>
                  Fee: ₱60 (₱50 + ₱10 service fee)
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
                      color="#2E86AB" 
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
                      color="#28A745" 
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                    <Text style={styles.paymentDescription}>{payment.description}</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={16} color="#6C757D" />
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
        {!selectedCategoryId && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#6C757D" />
            <Text style={styles.emptyTitle}>Select a Health Card Type</Text>
            <Text style={styles.emptyDescription}>
              Choose from the available health card types above to view the specific document requirements.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  instructionsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86AB',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  selectedCategoryCard: {
    borderColor: '#2E86AB',
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
    borderRadius: 10,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  orientationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orientationText: {
    fontSize: 12,
    color: '#2E86AB',
    marginLeft: 4,
  },
  requirementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  requirementsSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#212529',
    marginLeft: 8,
  },
  documentsList: {
    marginBottom: 20,
  },
  requirementItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requirementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requirementDetails: {
    flex: 1,
  },
  requirementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 18,
    marginBottom: 8,
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '500',
  },
  paymentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  paymentDescription: {
    fontSize: 12,
    color: '#6C757D',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  paymentNoteText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  actionButtons: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2E86AB',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
});
