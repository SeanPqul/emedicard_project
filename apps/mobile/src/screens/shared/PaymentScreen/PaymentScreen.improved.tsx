import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FeedbackSystem, useFeedback } from '@shared/components/feedback/feedback';
import { CustomButton } from '@shared/components';
import { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreenLayout } from '@/src/shared/components/layout/BaseScreenLayout';
import { usePayments } from '@features/payment';
import { useApplications } from '@features/application';
import { getColor } from '@shared/styles/theme';
import { styles } from '@shared/styles/screens/shared-payment.improved';
import { PAYMENT_METHODS, DIGITAL_PAYMENT_METHODS, MANUAL_PAYMENT_METHODS, type PaymentMethodId, type UploadedReceipt } from '@features/payment/constants';


export function PaymentScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const { messages, showSuccess, showError, showWarning, dismissFeedback } = useFeedback();
  
  // Use our API hooks instead of direct Convex calls
  const { data: { existingPayment }, mutations: { createPayment, updatePaymentStatus, generateUploadUrl }, isLoadingApplicationPayment } = usePayments(formId);
  const { data: { form }, isLoadingForm } = useApplications(formId);
  

  const getSelectedMethodDetails = () => {
    return PAYMENT_METHODS.find(method => method.id === selectedPaymentMethod);
  };

  const calculateTotal = () => {
    const method = getSelectedMethodDetails();
    if (!method) return 0;
    return method.fee + (method.serviceFee || 0);
  };

  const handleReceiptUpload = async () => {
    try {
      setIsUploadingReceipt(true);
      
      Alert.alert(
        'Upload Receipt',
        'Choose how you want to upload your receipt:',
        [
          { text: 'Camera', onPress: () => pickImageFromCamera() },
          { text: 'Gallery', onPress: () => pickImageFromGallery() },
          { text: 'Files', onPress: () => pickDocument() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Receipt upload error:', error);
      Alert.alert('Upload Error', 'Failed to upload receipt. Please try again.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadedReceipt({
        uri: asset.uri,
        name: `receipt_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: asset.fileSize || 0,
      });
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadedReceipt({
        uri: asset.uri,
        name: `receipt_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: asset.fileSize || 0,
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadedReceipt({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0,
      });
    }
  };

  const uploadReceiptToStorage = async (receipt: UploadedReceipt) => {
    try {
      const uploadUrl = await generateUploadUrl();
      
      const formData = new FormData();
      formData.append('file', {
        uri: receipt.uri,
        name: receipt.name,
        type: receipt.type,
      } as any);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = await response.json();
      return storageId;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Select a Payment Method', 'Please select a payment method before proceeding.');
      return;
    }

    if (!formId) {
      Alert.alert('Error', 'No form ID provided. Please try again.');
      return;
    }

    const method = getSelectedMethodDetails();
    if (!method) {
      Alert.alert('Error', 'Invalid payment method selected.');
      return;
    }

    // Validate requirements for different payment methods
    if (MANUAL_PAYMENT_METHODS.includes(method.id as any)) {
      if (!uploadedReceipt) {
        Alert.alert('Receipt Required', 'Please upload a receipt for manual payment methods.');
        return;
      }
    }

    if (DIGITAL_PAYMENT_METHODS.includes(method.id as any) && !referenceNumber.trim()) {
      Alert.alert('Reference Number Required', 'Please enter the reference number for your payment.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let receiptId: Id<"_storage"> | undefined;
      
      // Upload receipt if provided
      if (uploadedReceipt) {
        receiptId = await uploadReceiptToStorage(uploadedReceipt);
      }

      // Generate reference number if not provided
      const finalReferenceNumber = referenceNumber.trim() || `${method.id}-${Date.now()}`;

      // Create payment record
      const paymentId = await createPayment({
        applicationId: formId as Id<"applications">,
        amount: method.fee,
        serviceFee: method.serviceFee || 0,
        netAmount: calculateTotal(),
        paymentMethod: method.id as any,
        referenceNumber: finalReferenceNumber,
        receiptStorageId: receiptId,
      });

      // For digital payments, mark as complete immediately
      if (DIGITAL_PAYMENT_METHODS.includes(method.id as any)) {
        await updatePaymentStatus(paymentId, 'Complete');
      }

      setIsSubmitting(false);
      showSuccess(
        'Payment Processed',
        `Your payment has been ${DIGITAL_PAYMENT_METHODS.includes(method.id as any) ? 'processed' : 'recorded'}. Reference: ${finalReferenceNumber}`
      );
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Payment error:', error);
      showError('Payment Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <BaseScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>PAYMENT REQUIRED</Text>
          </View>
          <Text style={styles.summaryDescription}>
            Complete your payment to proceed with your health card application
          </Text>
          
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Application Fee</Text>
              <Text style={styles.feeValue}>₱50.00</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Service Fee</Text>
              <Text style={styles.feeValue}>₱10.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₱60.00</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {PAYMENT_METHODS.map(method => (
            <TouchableOpacity 
              key={method.id} 
              style={[
                styles.paymentOption,
                selectedPaymentMethod === method.id && styles.paymentOptionSelected
              ]} 
              onPress={() => setSelectedPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.paymentIconContainer,
                selectedPaymentMethod === method.id && styles.paymentIconContainerSelected
              ]}>
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedPaymentMethod === method.id ? getColor('primary.main') : getColor('text.secondary')} 
                />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={[
                  styles.paymentName,
                  selectedPaymentMethod === method.id && styles.paymentNameSelected
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
              </View>
              {selectedPaymentMethod === method.id && (
                <View style={styles.checkIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color={getColor('primary.main')} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Details Section */}
        {selectedPaymentMethod && (
          <View style={styles.detailsSection}>
            {/* Reference Number Input for Digital Payments */}
            {DIGITAL_PAYMENT_METHODS.includes(selectedPaymentMethod as any) && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reference Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={referenceNumber}
                    onChangeText={setReferenceNumber}
                    placeholder="Enter transaction reference number"
                    placeholderTextColor={getColor('text.secondary')}
                  />
                </View>
                <Text style={styles.inputHelper}>
                  Enter the reference number from your payment app
                </Text>
              </View>
            )}
            
            {/* Receipt Upload for Manual Payments */}
            {MANUAL_PAYMENT_METHODS.includes(selectedPaymentMethod as any) && (
              <View style={styles.uploadContainer}>
                <Text style={styles.inputLabel}>Upload Receipt</Text>
                {!uploadedReceipt ? (
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleReceiptUpload}
                    disabled={isUploadingReceipt}
                  >
                    <View style={styles.uploadIconContainer}>
                      <Ionicons name="cloud-upload-outline" size={32} color={getColor('primary.main')} />
                    </View>
                    <Text style={styles.uploadButtonText}>
                      {isUploadingReceipt ? 'Uploading...' : 'Tap to upload receipt'}
                    </Text>
                    <Text style={styles.uploadButtonSubtext}>
                      Supports images and PDF files
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.uploadedFileContainer}>
                    <View style={styles.uploadedFileIcon}>
                      <Ionicons name="document-text" size={24} color={getColor('success.main')} />
                    </View>
                    <View style={styles.uploadedFileInfo}>
                      <Text style={styles.uploadedFileName} numberOfLines={1}>
                        {uploadedReceipt.name}
                      </Text>
                      <Text style={styles.uploadedFileSize}>
                        {(uploadedReceipt.size / 1024).toFixed(1)} KB
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setUploadedReceipt(null)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={24} color={getColor('error.main')} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {/* Payment Instructions */}
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Ionicons name="information-circle-outline" size={20} color={getColor('primary.main')} />
                <Text style={styles.instructionsTitle}>Payment Instructions</Text>
              </View>
              {selectedPaymentMethod === 'Gcash' && (
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <Text style={styles.instructionText}>Open your GCash app</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <Text style={styles.instructionText}>Send ₱{calculateTotal()} to 09123456789</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <Text style={styles.instructionText}>Enter the reference number above</Text>
                  </View>
                </View>
              )}
              {selectedPaymentMethod === 'Maya' && (
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <Text style={styles.instructionText}>Open your Maya app</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <Text style={styles.instructionText}>Send ₱{calculateTotal()} to 09123456789</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <Text style={styles.instructionText}>Enter the reference number above</Text>
                  </View>
                </View>
              )}
              {selectedPaymentMethod === 'BaranggayHall' && (
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <Text style={styles.instructionText}>Visit your Barangay Hall</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <Text style={styles.instructionText}>Pay ₱{calculateTotal()} for health card processing</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <Text style={styles.instructionText}>Upload the official receipt above</Text>
                  </View>
                </View>
              )}
              {selectedPaymentMethod === 'CityHall' && (
                <View style={styles.instructionsList}>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1</Text>
                    <Text style={styles.instructionText}>Visit the City Hall</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2</Text>
                    <Text style={styles.instructionText}>Pay ₱{calculateTotal()} for health card processing</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3</Text>
                    <Text style={styles.instructionText}>Upload the official receipt above</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Existing Payment Display */}
        {existingPayment && (
          <View style={styles.existingPaymentCard}>
            <View style={styles.existingPaymentHeader}>
              <Ionicons name="checkmark-circle" size={24} color={getColor('success.main')} />
              <Text style={styles.existingPaymentTitle}>Payment Recorded</Text>
            </View>
            <View style={styles.existingPaymentDetails}>
              <View style={styles.existingPaymentRow}>
                <Text style={styles.existingPaymentLabel}>Status</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: existingPayment.paymentStatus === 'Complete' 
                    ? getColor('success.light') 
                    : getColor('warning.light') 
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { color: existingPayment.paymentStatus === 'Complete' 
                      ? getColor('success.main') 
                      : getColor('warning.main') 
                    }
                  ]}>
                    {existingPayment.paymentStatus}
                  </Text>
                </View>
              </View>
              <View style={styles.existingPaymentRow}>
                <Text style={styles.existingPaymentLabel}>Reference</Text>
                <Text style={styles.existingPaymentValue}>{existingPayment.referenceNumber}</Text>
              </View>
              <View style={styles.existingPaymentRow}>
                <Text style={styles.existingPaymentLabel}>Amount</Text>
                <Text style={styles.existingPaymentValue}>₱{existingPayment.netAmount}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.submitContainer}>
          <CustomButton 
            title={isSubmitting ? 'Processing Payment...' : 'Confirm Payment'}
            onPress={handlePayment}
            disabled={isSubmitting || !selectedPaymentMethod || !!existingPayment}
            size="large"
            style={styles.submitButton}
          />
          {!selectedPaymentMethod && (
            <Text style={styles.submitHelper}>Please select a payment method to continue</Text>
          )}
        </View>
      </ScrollView>
      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </BaseScreenLayout>
  );
}
