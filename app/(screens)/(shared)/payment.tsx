import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { CustomButton } from '../../../src/components';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: number;
  serviceFee?: number;
}

interface UploadedReceipt {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export default function PaymentScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedReceipt | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  
  // Convex queries and mutations
  const form = useQuery(api.forms.getFormById, formId ? { formId: formId as Id<"forms"> } : "skip");
  const existingPayment = useQuery(api.payments.getPaymentByFormId, formId ? { formId: formId as Id<"forms"> } : "skip");
  const createPayment = useMutation(api.payments.createPayment);
  const updatePaymentStatus = useMutation(api.payments.updatePaymentStatus);
  const generateUploadUrl = useMutation(api.requirements.generateUploadUrl);
  
  // Payment methods with real fees
  const paymentMethods: PaymentMethod[] = [
    { id: 'Gcash', name: 'GCash', description: 'Pay with GCash mobile wallet', icon: 'wallet', fee: 50, serviceFee: 5 },
    { id: 'Maya', name: 'Maya', description: 'Pay with Maya (formerly PayMaya)', icon: 'card', fee: 50, serviceFee: 5 },
    { id: 'BaranggayHall', name: 'Barangay Hall', description: 'Pay at the Barangay Hall', icon: 'home', fee: 50 },
    { id: 'CityHall', name: 'City Hall', description: 'Pay at the City Hall', icon: 'business', fee: 50 },
  ];

  const getSelectedMethodDetails = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod);
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
    if (method.id === 'BaranggayHall' || method.id === 'CityHall') {
      if (!uploadedReceipt) {
        Alert.alert('Receipt Required', 'Please upload a receipt for manual payment methods.');
        return;
      }
    }

    if ((method.id === 'Gcash' || method.id === 'Maya') && !referenceNumber.trim()) {
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
        formId: formId as Id<"forms">,
        amount: method.fee,
        serviceFee: method.serviceFee || 0,
        netAmount: calculateTotal(),
        method: method.id as any,
        referenceNumber: finalReferenceNumber,
        receiptId,
      });

      // For digital payments, mark as complete immediately
      if (method.id === 'Gcash' || method.id === 'Maya') {
        await updatePaymentStatus({
          paymentId,
          status: 'Complete',
        });
      }

      setIsSubmitting(false);
      Alert.alert(
        'Payment Processed',
        `Your payment has been ${method.id === 'Gcash' || method.id === 'Maya' ? 'processed' : 'recorded'}. Reference: ${finalReferenceNumber}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      console.error('Payment error:', error);
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <BaseScreenLayout>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Method Selection */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {paymentMethods.map(method => (
          <TouchableOpacity 
            key={method.id} 
            style={[
              styles.paymentOption,
              selectedPaymentMethod === method.id && styles.paymentOptionSelected
            ]} 
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <Ionicons 
              name={method.icon} 
              size={24} 
              color={selectedPaymentMethod === method.id ? '#10B981' : '#6C757D'} 
            />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentDescription}>{method.description}</Text>
              <Text style={styles.paymentFee}>₱{method.fee}</Text>
            </View>
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark" size={20} color="#10B981" />
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
                <Text style={styles.feeValue}>₱{getSelectedMethodDetails()?.fee}</Text>
              </View>
              {getSelectedMethodDetails()?.serviceFee && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Service Fee:</Text>
                  <Text style={styles.feeValue}>₱{getSelectedMethodDetails()?.serviceFee}</Text>
                </View>
              )}
              <View style={[styles.feeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>₱{calculateTotal()}</Text>
              </View>
            </View>
            
            {/* Reference Number Input for Digital Payments */}
            {(selectedPaymentMethod === 'Gcash' || selectedPaymentMethod === 'Maya') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reference Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={referenceNumber}
                  onChangeText={setReferenceNumber}
                  placeholder="Enter transaction reference number"
                  placeholderTextColor="#6C757D"
                />
              </View>
            )}
            
            {/* Receipt Upload for Manual Payments */}
            {(selectedPaymentMethod === 'BaranggayHall' || selectedPaymentMethod === 'CityHall') && (
              <View style={styles.uploadContainer}>
                <Text style={styles.inputLabel}>Receipt Upload *</Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleReceiptUpload}
                  disabled={isUploadingReceipt}
                >
                  <Ionicons name="camera-outline" size={24} color="#2E86AB" />
                  <Text style={styles.uploadButtonText}>
                    {isUploadingReceipt ? 'Uploading...' : 'Upload Receipt'}
                  </Text>
                </TouchableOpacity>
                
                {uploadedReceipt && (
                  <View style={styles.uploadedFileContainer}>
                    <View style={styles.uploadedFileInfo}>
                      <Ionicons name="document-text" size={20} color="#10B981" />
                      <Text style={styles.uploadedFileName}>{uploadedReceipt.name}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setUploadedReceipt(null)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#DC3545" />
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
                  2. Send ₱{calculateTotal()} to 09123456789{"\n"}
                  3. Enter the reference number above
                </Text>
              )}
              {selectedPaymentMethod === 'Maya' && (
                <Text style={styles.instructionsText}>
                  1. Open your Maya app{"\n"}
                  2. Send ₱{calculateTotal()} to 09123456789{"\n"}
                  3. Enter the reference number above
                </Text>
              )}
              {selectedPaymentMethod === 'BaranggayHall' && (
                <Text style={styles.instructionsText}>
                  1. Visit your Barangay Hall{"\n"}
                  2. Pay ₱{calculateTotal()} for health card processing{"\n"}
                  3. Upload the receipt using the button above
                </Text>
              )}
              {selectedPaymentMethod === 'CityHall' && (
                <Text style={styles.instructionsText}>
                  1. Visit the City Hall{"\n"}
                  2. Pay ₱{calculateTotal()} for health card processing{"\n"}
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
                <Text style={styles.paymentStatusText}>Status: {existingPayment.status}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: existingPayment.status === 'Complete' ? '#10B981' : '#F59E0B' }
                ]}>
                  <Text style={styles.statusBadgeText}>{existingPayment.status}</Text>
                </View>
              </View>
              <Text style={styles.paymentReference}>Reference: {existingPayment.referenceNumber}</Text>
              <Text style={styles.paymentAmount}>Amount: ₱{existingPayment.netAmount}</Text>
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
    </BaseScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  submitContainer: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  paymentOptionSelected: {
    borderColor: '#10B981',
    //backgroundColor: '#10B98108',
  },
  paymentButton: {
    width: '100%',
    height: 56,
    minHeight: 56,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    marginTop: 8,
  },
  paymentFee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  paymentDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feeBreakdown: {
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#212529',
  },
  uploadContainer: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#2E86AB',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  existingPaymentContainer: {
    marginTop: 20,
  },
  paymentStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentReference: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
});

