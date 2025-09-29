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
import { styles } from '@shared/styles/screens/shared-payment';
import { PAYMENT_METHODS, DIGITAL_PAYMENT_METHODS, MANUAL_PAYMENT_METHODS, type PaymentMethod, type UploadedReceipt } from '@features/payment/constants';


function PaymentScreen() {
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Method Selection */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity 
            key={method.id} 
            style={[
              styles.paymentOption,
              selectedPaymentMethod === method.id && styles.paymentOptionSelected
            ]} 
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon as any} 
              size={24} 
              color={selectedPaymentMethod === method.id ? getColor('success.main') : getColor('text.secondary')} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentDescription}>{method.description}</Text>
              <Text style={styles.paymentFee}>?{method.fee}</Text>
            </View>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark" size={20} color={getColor('success.main')} />
            )}
          </TouchableOpacity>
        ))}

        {/* Payment Details */}
        {selectedPaymentMethod && (
          <View style={styles.paymentDetailsContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            
            <View style={styles.feeBreakdown}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Base Fee:</Text>
                <Text style={styles.feeValue}>?{getSelectedMethodDetails()?.fee}</Text>
              </View>
              {getSelectedMethodDetails()?.serviceFee && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Service Fee:</Text>
                  <Text style={styles.feeValue}>?{getSelectedMethodDetails()?.serviceFee}</Text>
                </View>
              )}
              <View style={[styles.feeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>?{calculateTotal()}</Text>
              </View>
            </View>
            
            {/* Reference Number Input for Digital Payments */}
            {selectedPaymentMethod && DIGITAL_PAYMENT_METHODS.includes(selectedPaymentMethod as any) && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reference Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                  placeholder="Enter transaction reference number"
                  placeholderTextColor={getColor('text.secondary')}
                />
              </View>
            )}
            
            {/* Receipt Upload for Manual Payments */}
            {selectedPaymentMethod && MANUAL_PAYMENT_METHODS.includes(selectedPaymentMethod as any) && (
              <View style={styles.uploadContainer}>
                <Text style={styles.inputLabel}>Receipt Upload *</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleReceiptUpload}
                  disabled={isUploadingReceipt}
                >
                  <Ionicons name="camera-outline" size={24} color={getColor('primary.main')} />
                  <Text style={styles.uploadButtonText}>
                    {isUploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
                  </Text>
                </TouchableOpacity>
                
                {uploadedReceipt && (
                  <View style={styles.uploadedFileContainer}>
                    <View style={styles.uploadedFileInfo}>
                      <Ionicons name="document-text" size={20} color={getColor('success.main')} />
                      <Text style={styles.uploadedFileName}>{uploadedReceipt.name}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setUploadedReceipt(null)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color={getColor('error.main')} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            {/* Payment Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Payment Instructions:</Text>
              {selectedPaymentMethod === 'Gcash' && (
                <Text style={styles.instructionsText}>
                  1. Open your GCash app{"\n"}
                  2. Send ?{calculateTotal()} to 09123456789{"\n"}
                  3. Enter the reference number above
                </Text>
              )}
              {selectedPaymentMethod === 'Maya' && (
                <Text style={styles.instructionsText}>
                  1. Open your Maya app{"\n"}
                  2. Send ?{calculateTotal()} to 09123456789{"\n"}
                  3. Enter the reference number above
                </Text>
              )}
              {selectedPaymentMethod === 'BaranggayHall' && (
                <Text style={styles.instructionsText}>
                  1. Visit your Barangay Hall{"\n"}
                  2. Pay ?{calculateTotal()} for health card processing{"\n"}
                  3. Upload the receipt using the button above
                </Text>
              )}
              {selectedPaymentMethod === 'CityHall' && (
                <Text style={styles.instructionsText}>
                  1. Visit the City Hall{"\n"}
                  2. Pay ?{calculateTotal()} for health card processing{"\n"}
                  3. Upload the receipt using the button above
                </Text>
              )}
            </View>
          </View>
        )}
        
        {/* Existing Payment Display */}
        {existingPayment && (
          <View style={styles.existingPaymentContainer}>
            <Text style={styles.sectionTitle}>Existing Payment</Text>
            <View style={styles.paymentStatusCard}>
              <View style={styles.paymentStatusHeader}>
                <Text style={styles.paymentStatusText}>Status: {existingPayment.paymentStatus}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: existingPayment.paymentStatus === 'Complete' ? getColor('success.main') : getColor('warning.main') }
                ]}>
                  <Text style={styles.statusBadgeText}>{existingPayment.paymentStatus}</Text>
                </View>
              </View>
              <Text style={styles.paymentReference}>Reference: {existingPayment.referenceNumber}</Text>
              <Text style={styles.paymentAmount}>Amount: ?{existingPayment.netAmount}</Text>
            </View>
          </View>
        )}

        <View style={styles.submitContainer}>
          <CustomButton 
            title={isSubmitting ? 'Processing...' : 'Proceed to Pay'}
            onPress={handlePayment}
            disabled={isSubmitting || !selectedPaymentMethod || !!existingPayment}
            size="large"
            buttonStyle={styles.paymentButton}
          />
        </View>
      </ScrollView>
      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </BaseScreenLayout>
  );
}

export default PaymentScreen;
