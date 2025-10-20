import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Platform
} from 'react-native';
import { theme } from '@shared/styles/theme';
import { styles } from './DocumentRequirementsScreen.styles';
import { JobCategory } from '@entities/jobCategory/model/types';
import { useJobCategories } from '@features/jobCategory/hooks';
import { getHealthCardTypeName, getPaymentMethods } from '@features/healthCards';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import MayaLogo from '@/assets/svgs/maya-logo-brandlogos.net_gpvn1r359.svg';
import GCashLogo from '@/assets/svgs/gcash-logo-brandlogos.net_arv9ck6s2.svg';

interface Requirement {
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
}

// Helper function to get icon color based on document type
const getDocumentIconColor = (iconName: string): string => {
  const colorMap: Record<string, string> = {
    'card-outline': theme.colors.primary[500],      // Government ID - Blue
    'camera-outline': theme.colors.accent.warningOrange,    // Photo - Orange
    'medical-outline': theme.colors.semantic.error,     // Medical - Red
    'water-outline': theme.colors.blue[500],        // Urinalysis - Cyan
    'pulse-outline': theme.colors.accent.safetyGreen,     // Stool - Green
    'document-text-outline': theme.colors.primary[500], // Default - Blue
  };
  return colorMap[iconName] || theme.colors.primary[500];
};

// Helper function to get icon background color
const getDocumentIconBg = (iconName: string): string => {
  const bgMap: Record<string, string> = {
    'card-outline': theme.colors.primary[50],
    'camera-outline': theme.colors.accent.warningOrange + '15',
    'medical-outline': theme.colors.semantic.error + '15',
    'water-outline': theme.colors.blue[50],
    'pulse-outline': theme.colors.accent.safetyGreen + '15',
    'document-text-outline': theme.colors.primary[50],
  };
  return bgMap[iconName] || theme.colors.primary[50];
};

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
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Requirements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) }}>
            <Ionicons name="information-circle" size={moderateScale(20)} color={theme.colors.primary[500]} />
            <Text style={[styles.instructionsTitle, { marginBottom: 0, marginLeft: scale(8) }]}>How to Use</Text>
          </View>
          <Text style={styles.instructionsText}>
            Select a health card type below to view the required documents and payment options for your application.
          </Text>
        </View>
        {/* Health Card Type Selection */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>SELECT HEALTH CARD TYPE</Text>
          
          {jobCategories?.map((category: JobCategory) => (
            <Pressable
              key={category._id}
              style={[
                styles.categoryCard,
                selectedCategoryId === category._id && styles.selectedCategoryCard,
              ]}
              onPress={() => handleCategorySelect(category._id)}
              android_ripple={{
                color: 'transparent',
                borderless: false,
              }}
            >
              <View style={styles.categoryInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: category.colorCode }]} />
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.cardType}>{getHealthCardTypeName(category.name)}</Text>
                  {(category.requireOrientation === 'Yes' || category.requireOrientation === true) && (
                    <View style={styles.orientationBadge}>
                      <Ionicons name="school-outline" size={moderateScale(12)} color={theme.colors.primary[500]} />
                      <Text style={styles.orientationText}>Orientation Required</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[
                styles.chevronContainer,
                selectedCategoryId === category._id && styles.chevronContainerSelected
              ]}>
                <Ionicons 
                  name={selectedCategoryId === category._id ? "chevron-up" : "chevron-down"} 
                  size={moderateScale(18)} 
                  color={selectedCategoryId === category._id 
                    ? theme.colors.primary[500] 
                    : theme.colors.text.secondary}
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Requirements Display */}
        {selectedCategoryId && requirementsByCategory && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.sectionTitle}>
              REQUIRED DOCUMENTS
            </Text>
            
            <View style={styles.requirementsSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="document-text-outline" size={moderateScale(20)} color={theme.colors.primary[500]} />
                <Text style={styles.summaryText}>
                  {requirementsByCategory.totalRequirements} Documents Required
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="card-outline" size={moderateScale(20)} color={theme.colors.accent.safetyGreen} />
                <Text style={styles.summaryText}>
                  Application Fee: ₱60
                </Text>
              </View>
            </View>

            {/* Document List */}
            <View style={styles.documentsList}>
              {requirementsByCategory.requirements.map((requirement: Requirement, index: number) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={[styles.requirementIcon, { backgroundColor: getDocumentIconBg(requirement.icon) }]}>
                    <Ionicons 
                      name={requirement.icon as any} 
                      size={28} 
                      color={getDocumentIconColor(requirement.icon)}
                    />
                  </View>
                  <View style={styles.requirementDetails}>
                    <Text style={styles.requirementName}>{requirement.name}</Text>
                    <Text style={styles.requirementDescription}>{requirement.description}</Text>
                    {requirement.required && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>✓ Required</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Payment Options */}
            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>PAYMENT OPTIONS</Text>
              {getPaymentMethods(typeof requirementsByCategory.jobCategory === 'string' ? requirementsByCategory.jobCategory : requirementsByCategory.jobCategory?.name || 'standard').map((payment, index) => (
                <View key={index} style={styles.paymentOption}>
                  <View style={styles.paymentIcon}>
                    {payment.method.includes('GCash') ? (
                      <GCashLogo width={moderateScale(40)} height={moderateScale(30)} />
                    ) : payment.method.includes('Maya') ? (
                      <MayaLogo width={moderateScale(40)} height={moderateScale(30)} />
                    ) : (
                      <Ionicons 
                        name="business-outline" 
                        size={moderateScale(28)} 
                        color={theme.colors.accent.safetyGreen}
                      />
                    )}
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                    <Text style={styles.paymentDescription}>{payment.description}</Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={moderateScale(16)} color={theme.colors.text.secondary} />
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
                <Text style={styles.primaryButtonText}>Start New Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push('/(tabs)/application')}
              >
                <Text style={styles.secondaryButtonText}>View Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* Empty State */}
        {!selectedCategoryId && jobCategories && jobCategories.length > 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="document-text" size={moderateScale(56)} color={theme.colors.primary[500]} />
            </View>
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