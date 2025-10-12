import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image, Alert, Platform, Linking } from 'react-native';
import { BaseScreenLayout } from '@/src/shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Id } from '@backend/convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { getColor } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ViewDocumentsScreen.styles';
import { ResubmitModal } from '@features/document-resubmit';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DocumentViewHeader } from './DocumentViewHeader';

interface DocumentWithRequirement {
  _id: Id<'documentUploads'>;
  applicationId: Id<'applications'>;
  documentTypeId: Id<'documentTypes'>;
  originalFileName: string;
  storageFileId: Id<'_storage'>;
  uploadedAt: number;
  reviewStatus: string;
  adminRemarks?: string;
  reviewedBy?: Id<'users'>;
  reviewedAt?: number;
  hasFile?: boolean; // Changed from fileUrl to hasFile for security
  requirement: {
    _id: Id<'documentTypes'>;
    name: string;
    description: string;
    icon: string;
    isRequired: boolean;
    fieldIdentifier: string;
  } | null;
}

export function ViewDocumentsScreen() {
  const params = useLocalSearchParams();
  const formId = params.formId as Id<'applications'>;
  const [viewingDocument, setViewingDocument] = useState<DocumentWithRequirement | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [downloadingDocument, setDownloadingDocument] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitDocumentTypeId, setResubmitDocumentTypeId] = useState<Id<'documentTypes'> | null>(null);
  const [resubmitFieldIdentifier, setResubmitFieldIdentifier] = useState<string>('');
  const [resubmitDocumentName, setResubmitDocumentName] = useState<string>('');
  
  // Mutation for getting secure document URL
  const getSecureUrl = useMutation(api.documents.secureAccessQueries.getSecureDocumentUrl);
  
  // Fetch documents with requirements
  const documentsData = useQuery(
    api.requirements.getFormDocumentsRequirements.getApplicationDocumentsRequirementsQuery,
    formId ? { applicationId: formId } : 'skip'
  );
  
  // Fetch rejection history
  const rejectionHistory = useQuery(
    api.documents.rejectionQueries.getRejectionHistory,
    formId ? { applicationId: formId } : 'skip'
  );
  
  const isLoading = documentsData === undefined || rejectionHistory === undefined;
  const uploadedDocuments = documentsData?.uploadedDocuments || [];
  const requiredDocuments = documentsData?.requiredDocuments || [];
  const application = documentsData?.application;
  const rejections = rejectionHistory || [];
  
  // Get active rejections (not replaced)
  const activeRejections = rejections.filter(r => !r.wasReplaced);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return getColor('accent.safetyGreen');
      case 'Rejected':
        return getColor('semantic.error');
      case 'Pending':
      default:
        return getColor('accent.warningOrange');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      case 'Pending':
      default:
        return 'time-outline';
    }
  };

  const handleViewDocument = async (doc: DocumentWithRequirement) => {
    // Check if document has a file - works with both old and new backend
    const hasDocument = doc.hasFile || !!doc.storageFileId || !!(doc as any).fileUrl;
    
    if (!hasDocument) {
      Alert.alert('Error', 'Document file not available.');
      return;
    }
    
    setLoadingDocument(true);
    setViewingDocument(doc);
    
    try {
      // Get secure URL with time-limited token
      const secureUrlData = await getSecureUrl({ documentId: doc._id });
      setDocumentUrl(secureUrlData.url);
    } catch (error) {
      console.error('Error getting secure document URL:', error);
      Alert.alert('Error', 'Unable to load document. Please try again.');
      setViewingDocument(null);
    } finally {
      setLoadingDocument(false);
    }
  };
  
  // Function to refresh expired token
  const refreshDocumentUrl = async () => {
    if (!viewingDocument) return;
    
    setLoadingDocument(true);
    try {
      // Generate a new secure URL
      const secureUrlData = await getSecureUrl({ documentId: viewingDocument._id });
      setDocumentUrl(secureUrlData.url);
    } catch (error) {
      console.error('Error refreshing document URL:', error);
      Alert.alert('Error', 'Unable to refresh document. Please try again.');
    } finally {
      setLoadingDocument(false);
    }
  };

  // Function to download document
  const handleDownloadDocument = async () => {
    if (!documentUrl || !viewingDocument) return;
    
    setDownloadingDocument(true);
    
    try {
      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = viewingDocument.originalFileName;
        link.click();
        Alert.alert('Success', 'Document download started!');
      } else {
        // For mobile, check if sharing is available
        const sharingAvailable = await Sharing.isAvailableAsync();
        
        if (!sharingAvailable) {
          Alert.alert('Error', 'Sharing is not available on this device.');
          return;
        }
        
        // Create a filename for the download
        const fileName = viewingDocument.originalFileName;
        const fileUri = (FileSystem as any).documentDirectory ? `${(FileSystem as any).documentDirectory}${fileName}` : fileName;
        
        // Download the file
        const downloadResult = await FileSystem.downloadAsync(
          documentUrl,
          fileUri
        );
        
        if (downloadResult.status !== 200) {
          throw new Error('Failed to download document');
        }
        
        // Open the share dialog for users to choose where to save
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: viewingDocument.originalFileName.toLowerCase().endsWith('.pdf') 
            ? 'application/pdf' 
            : viewingDocument.originalFileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp)$/i)
            ? 'image/*'
            : 'application/octet-stream',
          dialogTitle: `Save ${viewingDocument.requirement?.name || viewingDocument.originalFileName}`,
          UTI: viewingDocument.originalFileName.toLowerCase().endsWith('.pdf')
            ? 'com.adobe.pdf'
            : viewingDocument.originalFileName.toLowerCase().match(/\.(jpg|jpeg)$/i)
            ? 'public.jpeg'
            : viewingDocument.originalFileName.toLowerCase().endsWith('.png')
            ? 'public.png'
            : undefined,
        });
        
        // Note: We can't detect if the user actually saved or cancelled the share dialog,
        // but this gives them full control over where to save the file
        
        // Clean up the temporary file after a delay to ensure sharing completes
        setTimeout(async () => {
          try {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
          } catch (cleanupError) {
            console.log('Cleanup error (non-critical):', cleanupError);
          }
        }, 5000); // Wait 5 seconds before cleanup
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Unable to download document. Please try again.');
    } finally {
      setDownloadingDocument(false);
    }
  };






  if (isLoading) {
    return (
      <BaseScreenLayout>
        <DocumentViewHeader
          documentCount={0}
          rejectedCount={0}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={getColor('primary.500')} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </BaseScreenLayout>
    );
  }

  return (
    <BaseScreenLayout>
      {/* Green Branded Header */}
      <DocumentViewHeader
        documentCount={uploadedDocuments.length}
        rejectedCount={activeRejections.length}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Application Status Info */}
        {application && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={moderateScale(20)} color={getColor('primary.500')} />
            <Text style={styles.infoText}>
              {application.applicationStatus === 'Pending Payment'
                ? 'Documents will be verified after payment is confirmed.'
                : application.applicationStatus === 'Submitted'
                ? 'Your documents are waiting for verification by our team.'
                : application.applicationStatus === 'Under Review'
                ? 'Your documents are currently being verified.'
                : application.applicationStatus === 'Rejected' && activeRejections.length > 0
                ? `${activeRejections.length} document${activeRejections.length > 1 ? 's need' : ' needs'} to be revised and resubmitted.`
                : 'You can view all your uploaded documents below.'}
            </Text>
          </View>
        )}


        {/* Documents List */}
        <View style={styles.documentsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Documents ({uploadedDocuments.length})</Text>
            {rejections.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/(screens)/(shared)/documents/rejection-history?formId=${formId}`)}
                style={styles.historyButton}
              >
                <Ionicons name="time-outline" size={moderateScale(16)} color={getColor('primary.500')} />
                <Text style={styles.historyButtonText}>History</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {uploadedDocuments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={moderateScale(64)} color={getColor('text.tertiary')} />
              <Text style={styles.emptyStateTitle}>No Documents Available</Text>
              <Text style={styles.emptyStateText}>
                Documents are managed during the application process. You can view details from your application.
              </Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => router.push(`/(screens)/(application)/${formId}`)}>
                <Ionicons name="arrow-back-outline" size={moderateScale(20)} color={getColor('background.primary')} />
                <Text style={styles.uploadButtonText}>Back to Application</Text>
              </TouchableOpacity>
            </View>
          ) : (
            uploadedDocuments.map((doc: DocumentWithRequirement) => (
              <View key={doc._id} style={styles.documentCard}>
                <TouchableOpacity 
                  style={styles.documentHeader}
                  onPress={() => handleViewDocument(doc)}
                >
                  <View style={styles.documentIconContainer}>
                    <Ionicons 
                      name={doc.requirement?.icon as any || 'document-text'} 
                      size={moderateScale(20)} 
                      color="#666" 
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.requirement?.name || 'Document'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.reviewStatus) + '20' }]}>
                      <Ionicons 
                        name={getStatusIcon(doc.reviewStatus) as any} 
                        size={moderateScale(14)} 
                        color={getStatusColor(doc.reviewStatus)} 
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(doc.reviewStatus) }]}>
                        {doc.reviewStatus}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
                </TouchableOpacity>

                {doc.reviewStatus === 'Rejected' && (
                  <TouchableOpacity 
                    style={[styles.documentHeader, styles.documentSubItem]}
                    onPress={() => {
                      if (doc.documentTypeId && doc.requirement?.name && doc.requirement?.fieldIdentifier) {
                        setResubmitDocumentTypeId(doc.documentTypeId);
                        setResubmitFieldIdentifier(doc.requirement.fieldIdentifier);
                        setResubmitDocumentName(doc.requirement.name);
                        setShowResubmitModal(true);
                      }
                    }}
                  >
                    <View style={styles.documentIconContainer}>
                      <Ionicons name="refresh-outline" size={moderateScale(20)} color={getColor('semantic.error')} />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentSubItemText}>Replace rejected document</Text>
                      <Text style={styles.rejectionReason}>{doc.adminRemarks || 'Document needs revision'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Document Viewer Modal */}
      <Modal
        visible={!!viewingDocument}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setViewingDocument(null);
          setDocumentUrl(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setViewingDocument(null);
              setDocumentUrl(null);
            }}>
              <Ionicons name="close" size={moderateScale(28)} color={getColor('text.primary')} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {viewingDocument?.requirement?.name || viewingDocument?.originalFileName}
            </Text>
            {documentUrl && (
              <TouchableOpacity 
                onPress={handleDownloadDocument}
                disabled={downloadingDocument}
              >
                {downloadingDocument ? (
                  <ActivityIndicator size="small" color={getColor('primary.500')} />
                ) : (
                  <Ionicons name="download-outline" size={moderateScale(24)} color={getColor('primary.500')} />
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {loadingDocument ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={getColor('primary.500')} />
              <Text style={styles.loadingText}>Loading document...</Text>
            </View>
          ) : viewingDocument && documentUrl ? (
            <View style={styles.documentViewerContent}>
              {viewingDocument.originalFileName.toLowerCase().endsWith('.pdf') ? (
                Platform.OS === 'web' ? (
                  // For web, show the PDF icon with message
                  <View style={styles.pdfContainer}>
                    <Ionicons name="document-text" size={moderateScale(80)} color={getColor('text.secondary')} />
                    <Text style={styles.pdfText}>PDF Document</Text>
                    <Text style={styles.pdfFileName}>{viewingDocument.originalFileName}</Text>
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={handleDownloadDocument}
                      disabled={downloadingDocument}
                    >
                      {downloadingDocument ? (
                        <ActivityIndicator size="small" color={getColor('background.primary')} />
                      ) : (
                        <>
                          <Ionicons name="download-outline" size={moderateScale(20)} color={getColor('background.primary')} />
                          <Text style={styles.downloadButtonText}>Download PDF</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  // For mobile, use Google Docs Viewer to display PDF
                  <WebView
                    source={{ 
                      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(documentUrl)}` 
                    }}
                    style={styles.pdfViewer}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={getColor('primary.500')} />
                        <Text style={styles.loadingText}>Loading PDF...</Text>
                      </View>
                    )}
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      console.warn('WebView error: ', nativeEvent);
                      Alert.alert(
                        'Unable to Display PDF',
                        'The PDF viewer encountered an error. Try downloading the document instead.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Download', 
                            onPress: handleDownloadDocument
                          }
                        ]
                      );
                    }}
                    // Enable PDF viewing
                    allowsInlineMediaPlayback={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={['*']}
                    mixedContentMode="always"
                  />
                )
              ) : (
                <ScrollView 
                  contentContainerStyle={styles.imageScrollContainer}
                  maximumZoomScale={3}
                  minimumZoomScale={0.5}
                  pinchGestureEnabled
                >
                  <Image 
                    source={{ uri: documentUrl }}
                    style={styles.documentImage}
                    resizeMode="contain"
                    onError={() => {
                      // Silently refresh the URL if it fails to load (likely due to expired token)
                      refreshDocumentUrl();
                    }}
                  />
                </ScrollView>
              )}
            </View>
          ) : null}
        </View>
      </Modal>
      
      {/* Resubmit Modal */}
      <ResubmitModal
        visible={showResubmitModal}
        onClose={() => {
          setShowResubmitModal(false);
          setResubmitDocumentTypeId(null);
          setResubmitFieldIdentifier('');
          setResubmitDocumentName('');
        }}
        onSuccess={() => {
          setShowResubmitModal(false);
          Alert.alert('Success', 'Document resubmitted successfully!');
          // Refresh will happen automatically through Convex reactivity
        }}
        applicationId={formId}
        documentTypeId={resubmitDocumentTypeId!}
        fieldIdentifier={resubmitFieldIdentifier}
        documentName={resubmitDocumentName}
      />
    </BaseScreenLayout>
  );
}

