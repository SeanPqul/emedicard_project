import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@shared/components';
import { PaymentMethod } from '@entities/application';
import { useManualPaymentUpload, ManualPaymentReceipt } from '@features/payment/hooks/useManualPaymentUpload';
import { Id } from '@backend/convex/_generated/dataModel';
import { styles } from './ManualPaymentScreen.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';
import { DAVAO_CITY_BARANGAYS, SANGGUNIAN_HALL_LOCATION, getLocationLabel, getLocationOptions } from '@shared/constants/barangays';
import { usePricing } from '@/src/features/payment/hooks/usePricing';

export function ManualPaymentScreen() {
  const params = useLocalSearchParams<{
    applicationId: string;
    paymentMethod: PaymentMethod;
  }>();

  const [referenceNumber, setReferenceNumber] = useState('');
  // Auto-select Sanggunian Hall for CityHall payment method
  const [paymentLocation, setPaymentLocation] = useState(
    params.paymentMethod === 'CityHall' ? SANGGUNIAN_HALL_LOCATION : ''
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [receipt, setReceipt] = useState<ManualPaymentReceipt | null>(null);
  const [errors, setErrors] = useState<{ referenceNumber?: string; paymentLocation?: string; receipt?: string }>({});

  const { submitManualPayment, isUploading, uploadProgress } = useManualPaymentUpload();

  // Get dynamic pricing based on selected payment method
  const { baseFee, serviceFee, totalFee } = usePricing(params.paymentMethod || 'Maya');

  // Refs for scrolling to errors
  const paymentMethodName = params.paymentMethod === 'BaranggayHall' ? 'Barangay Hall' : 'Sanggunian Hall';

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload a receipt.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setReceipt({
          uri: asset.uri,
          fileName: asset.fileName || `receipt-${Date.now()}.jpg`,
          fileType: asset.mimeType || 'image/jpeg',
          fileSize: asset.fileSize || 0,
        });
        setErrors(prev => ({ ...prev, receipt: undefined }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a photo of your receipt.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setReceipt({
          uri: asset.uri,
          fileName: `receipt-${Date.now()}.jpg`,
          fileType: 'image/jpeg',
          fileSize: asset.fileSize || 0,
        });
        setErrors(prev => ({ ...prev, receipt: undefined }));
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!referenceNumber.trim()) {
      newErrors.referenceNumber = 'Reference number is required';
    }

    if (!paymentLocation.trim()) {
      newErrors.paymentLocation = 'Payment location is required';
    }

    if (!receipt) {
      newErrors.receipt = 'Receipt image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    if (!params.applicationId || !params.paymentMethod || !receipt) {
      Alert.alert('Error', 'Missing required payment information');
      return;
    }

    // Format location display
    const locationDisplay = params.paymentMethod === 'BaranggayHall' && !paymentLocation.toLowerCase().includes('barangay')
      ? `Barangay ${paymentLocation}`
      : paymentLocation;

    Alert.alert(
      'Confirm Payment Submission',
      `Submit payment for ${paymentMethodName}?\n\nPayment Location: ${locationDisplay}\nReference Number: ${referenceNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            const result = await submitManualPayment({
              applicationId: params.applicationId as Id<'applications'>,
              paymentMethod: params.paymentMethod,
              paymentLocation: paymentLocation.trim(),
              referenceNumber: referenceNumber.trim(),
              receipt,
            });

            if (result.success) {
              Alert.alert(
                'Payment Submitted',
                'Your payment has been submitted for verification. You will be notified once it is approved.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace(`/(screens)/(application)/${params.applicationId}`);
                    },
                  },
                ]
              );
            } else {
              Alert.alert('Submission Failed', result.error || 'Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Over-the-Counter Payment</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Payment Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={params.paymentMethod === 'BaranggayHall' ? 'business' : 'home'}
              size={moderateScale(32)}
              color={theme.colors.primary[500]}
            />
          </View>
          <Text style={styles.paymentMethodTitle}>{paymentMethodName}</Text>
          <Text style={styles.paymentMethodDescription}>
            {params.paymentMethod === 'BaranggayHall' 
              ? 'Pay at your barangay hall in Davao City and upload your receipt'
              : 'Pay at Sangguniang Panlungsod ng Dabaw and upload your receipt'
            }
          </Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.sectionTitle}>Payment Amount</Text>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Application Fee</Text>
                        <Text style={styles.feeValue}>₱{baseFee}.00</Text>
                      </View>
                      <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Processing Fee</Text>
                        <Text style={styles.feeValue}>₱{serviceFee}.00</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₱{totalFee}.00</Text>
                      </View>        </View>

        {/* Instructions Card */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Ionicons
              name="information-circle"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.instructionsTitle}>Payment Instructions</Text>
          </View>
          <Text style={styles.instructionStep}>
            1. Visit {params.paymentMethod === 'BaranggayHall' ? 'your barangay hall in Davao City' : 'Sangguniang Panlungsod ng Dabaw'}
          </Text>
          <Text style={styles.instructionStep}>
            2. Pay the total amount of ₱{totalFee}.00
          </Text>
          <Text style={styles.instructionStep}>
            3. Get your official receipt
          </Text>
          <Text style={styles.instructionStep}>
            4. Enter the reference number and upload a photo of your receipt below
          </Text>
        </View>

        {/* Reference Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Reference Number or OR <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, errors.referenceNumber && styles.inputError]}
            placeholder="Enter receipt reference number"
            value={referenceNumber}
            onChangeText={(text) => {
              setReferenceNumber(text);
              setErrors(prev => ({ ...prev, referenceNumber: undefined }));
            }}
            editable={!isUploading}
          />
          {errors.referenceNumber && (
            <Text style={styles.errorText}>{errors.referenceNumber}</Text>
          )}
        </View>

        {/* Payment Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {params.paymentMethod === 'BaranggayHall' ? 'Select Barangay' : 'Payment Location'}{' '}
            <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.textInput, errors.paymentLocation && styles.inputError, { justifyContent: 'center' }]}
            onPress={() => setIsLocationModalOpen(true)}
            disabled={isUploading || params.paymentMethod === 'CityHall'}
          >
            <Text style={paymentLocation ? styles.selectedLocationText : styles.placeholderText}>
              {paymentLocation || (params.paymentMethod === 'BaranggayHall' ? 'Select your barangay' : 'Payment location')}
            </Text>
          </TouchableOpacity>
          {errors.paymentLocation && (
            <Text style={styles.errorText}>{errors.paymentLocation}</Text>
          )}
        </View>

        {/* Receipt Upload */}
        <View style={styles.uploadContainer}>
          <Text style={styles.inputLabel}>
            Upload Receipt <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          
          {!receipt ? (
            <View>
              <TouchableOpacity
                style={[styles.uploadButton, errors.receipt && styles.uploadButtonError]}
                onPress={handlePickImage}
                disabled={isUploading}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={moderateScale(32)}
                  color={errors.receipt ? theme.colors.semantic.error : theme.colors.primary[500]}
                />
                <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleTakePhoto}
                disabled={isUploading}
              >
                <Ionicons
                  name="camera-outline"
                  size={moderateScale(24)}
                  color={theme.colors.primary[500]}
                />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>

              {errors.receipt && (
                <Text style={styles.errorText}>{errors.receipt}</Text>
              )}
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: receipt.uri }} style={styles.receiptPreview} />
              <View style={styles.receiptInfo}>
                <Text style={styles.receiptFileName} numberOfLines={1}>
                  {receipt.fileName}
                </Text>
                <Text style={styles.receiptFileSize}>
                  {(receipt.fileSize / 1024).toFixed(2)} KB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveReceipt}
                disabled={isUploading}
              >
                <Ionicons name="close-circle" size={moderateScale(24)} color={theme.colors.semantic.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Submit Payment"
            onPress={handleSubmit}
            variant="primary"
            disabled={isUploading}
            loading={isUploading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={isLocationModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLocationModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {params.paymentMethod === 'BaranggayHall' ? 'Select Barangay' : 'Select Location'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLocationModalOpen(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={moderateScale(24)} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {params.paymentMethod === 'BaranggayHall' && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={moderateScale(20)} color={theme.colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search barangay..."
                  value={locationSearchQuery}
                  onChangeText={setLocationSearchQuery}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Location List */}
            <FlatList
              data={getLocationOptions(params.paymentMethod as 'BaranggayHall' | 'CityHall').filter(location =>
                location.toLowerCase().includes(locationSearchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    paymentLocation === item && styles.locationItemSelected,
                  ]}
                  onPress={() => {
                    setPaymentLocation(item);
                    setErrors(prev => ({ ...prev, paymentLocation: undefined }));
                    setIsLocationModalOpen(false);
                    setLocationSearchQuery('');
                  }}
                >
                  <Text
                    style={[
                      styles.locationItemText,
                      paymentLocation === item && styles.locationItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {paymentLocation === item && (
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(20)}
                      color={theme.colors.primary[500]}
                    />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.locationSeparator} />}
              style={styles.locationList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
