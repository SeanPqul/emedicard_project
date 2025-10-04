/**
 * Manual demo/test file for DocumentRejectionWidget
 * This file demonstrates the various states and behaviors of the widget
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Button } from 'react-native';
import { DocumentRejectionWidget } from './DocumentRejectionWidget';
import { EnrichedRejection, RejectionCategory } from '@entities/document/model/rejection-types';
import { Id } from '@backend/convex/_generated/dataModel';

// Mock data samples
const mockRejections: Record<string, EnrichedRejection> = {
  qualityIssue: {
    _id: 'demo-quality-id' as Id<"documentRejectionHistory">,
    applicationId: 'demo-app-id' as Id<"applications">,
    documentTypeId: 'demo-doc-type-id' as Id<"documentTypes">,
    documentTypeName: 'Valid ID',
    documentTypeIcon: 'card',
    rejectionCategory: RejectionCategory.QUALITY_ISSUE,
    rejectionReason: 'The uploaded image is too blurry to read the text clearly.',
    specificIssues: [
      'Image resolution is too low',
      'Text on the ID is not readable',
      'Photo appears to be taken from too far away'
    ],
    rejectedAt: Date.now() - 3600000, // 1 hour ago
    rejectedByName: 'Admin John',
    attemptNumber: 1,
    wasReplaced: false,
    replacedAt: undefined,
    replacementInfo: null,
  },
  wrongDocument: {
    _id: 'demo-wrong-doc-id' as Id<"documentRejectionHistory">,
    applicationId: 'demo-app-id' as Id<"applications">,
    documentTypeId: 'demo-doc-type-id' as Id<"documentTypes">,
    documentTypeName: 'Birth Certificate',
    documentTypeIcon: 'document',
    rejectionCategory: RejectionCategory.WRONG_DOCUMENT,
    rejectionReason: 'You uploaded a drivers license instead of a birth certificate.',
    specificIssues: [
      'Wrong document type uploaded',
      'Please upload your birth certificate'
    ],
    rejectedAt: Date.now() - 86400000, // 1 day ago
    rejectedByName: 'Admin Sarah',
    attemptNumber: 2,
    wasReplaced: false,
    replacedAt: undefined,
    replacementInfo: null,
  },
  expiredDocument: {
    _id: 'demo-expired-id' as Id<"documentRejectionHistory">,
    applicationId: 'demo-app-id' as Id<"applications">,
    documentTypeId: 'demo-doc-type-id' as Id<"documentTypes">,
    documentTypeName: 'Health Certificate',
    documentTypeIcon: 'medical',
    rejectionCategory: RejectionCategory.EXPIRED_DOCUMENT,
    rejectionReason: 'The health certificate has expired. Please provide a current certificate.',
    specificIssues: [
      'Certificate expired on Jan 15, 2024',
      'New certificate must be dated within the last 6 months'
    ],
    rejectedAt: Date.now() - 172800000, // 2 days ago
    rejectedByName: 'Admin Mike',
    attemptNumber: 1,
    wasReplaced: true,
    replacedAt: Date.now() - 3600000,
    replacementInfo: {
      uploadId: 'new-upload-id' as Id<"documentUploads">,
      fileName: 'health-cert-new.jpg',
      uploadedAt: Date.now() - 3600000,
      reviewStatus: 'Pending',
    },
  },
};

export function DocumentRejectionWidgetDemo() {
  const [selectedDemo, setSelectedDemo] = useState<keyof typeof mockRejections>('qualityIssue');
  const [showActions, setShowActions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleResubmit = () => {
    console.log('Resubmit clicked for:', selectedDemo);
    alert('Resubmit action triggered!');
  };

  const handleViewDetails = () => {
    console.log('View details clicked for:', selectedDemo);
    alert('View details action triggered!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>DocumentRejectionWidget Demo</Text>
      
      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.sectionTitle}>Select Rejection Type:</Text>
        {Object.keys(mockRejections).map((key) => (
          <Button
            key={key}
            title={key}
            onPress={() => setSelectedDemo(key as keyof typeof mockRejections)}
            color={selectedDemo === key ? '#10b981' : '#666'}
          />
        ))}
        
        <View style={styles.toggleRow}>
          <Text>Show Actions:</Text>
          <Button
            title={showActions ? 'ON' : 'OFF'}
            onPress={() => setShowActions(!showActions)}
            color={showActions ? '#10b981' : '#666'}
          />
        </View>
        
        <View style={styles.toggleRow}>
          <Text>Loading State:</Text>
          <Button
            title={isLoading ? 'ON' : 'OFF'}
            onPress={() => setIsLoading(!isLoading)}
            color={isLoading ? '#10b981' : '#666'}
          />
        </View>
      </View>

      {/* Widget Demo */}
      <View style={styles.widgetContainer}>
        <Text style={styles.sectionTitle}>Widget Preview:</Text>
        {mockRejections[selectedDemo] && (
          <DocumentRejectionWidget
            rejection={mockRejections[selectedDemo]}
            documentName={mockRejections[selectedDemo].documentTypeName}
            onResubmit={handleResubmit}
            onViewDetails={handleViewDetails}
            showActions={showActions}
            isLoading={isLoading}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.sectionTitle}>Current State:</Text>
        <Text>Type: {selectedDemo}</Text>
        {mockRejections[selectedDemo] && (
          <>
            <Text>Category: {mockRejections[selectedDemo].rejectionCategory}</Text>
            <Text>Attempt #: {mockRejections[selectedDemo].attemptNumber}</Text>
            <Text>Was Replaced: {mockRejections[selectedDemo].wasReplaced ? 'Yes' : 'No'}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  widgetContainer: {
    marginBottom: 16,
  },
  info: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
});
