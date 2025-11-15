import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Share, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { BaseScreenLayout } from '../../../shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import QRCode from 'react-native-qrcode-svg';
import { getColor } from '../../../shared/styles/theme';
import { styles } from '../../../shared/styles/screens/shared-qr-code';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { generateVerificationUrl } from '../../../features/healthCards/lib/health-card-display-utils';

export function QRCodeScreen() {
  const qrRef = useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Fetch actual health cards from the API
  const userHealthCards = useQuery(api.healthCards.getUserCards.getUserCardsQuery);
  
  // Get the first active health card
  const healthCard = userHealthCards && userHealthCards.length > 0 ? userHealthCards[0] : null;
  
  // Format date helper
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
  // Get holder name from application
  const getHolderName = () => {
    if (!healthCard?.application) return 'N/A';
    const app = healthCard.application;
    if (app.firstName && app.lastName) {
      return `${app.firstName} ${app.middleName ? app.middleName + ' ' : ''}${app.lastName}`.trim();
    }
    return 'Health Card Holder';
  };

  const handleDownloadQR = async () => {
    if (!healthCard || !qrRef.current) return;
    
    setIsSaving(true);
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save QR code to your gallery.');
        setIsSaving(false);
        return;
      }
      
      // Capture the QR code as image
      const uri = await qrRef.current.capture();
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Health Cards', asset, false);
      
      Alert.alert('Success', 'QR Code saved to your gallery!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleShareQR = async () => {
    if (!healthCard || !healthCard._id) return;
    
    setIsSharing(true);
    try {
      const verificationUrl = generateVerificationUrl(healthCard as any);
      await Share.share({
        message: `🏥 Health Card QR Code\n\n📋 Registration: ${healthCard.registrationNumber}\n🏷️ Type: ${healthCard.jobCategory?.name || 'Health Card'}\n👤 Holder: ${getHolderName()}\n📅 Expires: ${formatDate(healthCard.expiryDate)}\n\n✅ Verify at: ${verificationUrl}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  // Loading state
  if (userHealthCards === undefined) {
    return (
      <BaseScreenLayout>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Card QR</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={getColor('primary.main')} />
          <Text style={{ marginTop: 16, color: getColor('text.secondary') }}>Loading health card...</Text>
        </View>
      </BaseScreenLayout>
    );
  }
  
  // No health card state
  if (!healthCard) {
    return (
      <BaseScreenLayout>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Card QR</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={64} color={getColor('text.secondary')} />
          <Text style={{ marginTop: 16, fontSize: 16, color: getColor('text.primary'), fontWeight: '600' }}>No Health Card Found</Text>
          <Text style={{ marginTop: 8, color: getColor('text.secondary'), textAlign: 'center', paddingHorizontal: 32 }}>You don't have an active health card yet. Please apply for one first.</Text>
          <TouchableOpacity 
            style={{ marginTop: 24, backgroundColor: getColor('primary.main'), paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            onPress={() => router.push('/(tabs)/apply')}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Apply for Health Card</Text>
          </TouchableOpacity>
        </View>
      </BaseScreenLayout>
    );
  }
  
  return (
    <BaseScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Card QR</Text>
        <TouchableOpacity onPress={handleShareQR}>
          <Ionicons name="share-outline" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Container */}
        <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
          <View style={styles.qrContainer}>
            <QRCode
              value={generateVerificationUrl(healthCard as any)}
              size={200}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
        </ViewShot>

        {/* Card Information */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{healthCard.jobCategory?.name || 'Health Card'}</Text>
          <Text style={styles.cardId}>ID: {healthCard.registrationNumber}</Text>
          <Text style={styles.cardDetail}>Holder: {getHolderName()}</Text>
          <Text style={styles.cardDetail}>Expires: {formatDate(healthCard.expiryDate)}</Text>
          <Text style={styles.cardDetail}>Issued by: Davao City Health Office</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to use this QR Code</Text>
          <Text style={styles.instructionsText}>
            • Show this QR code to health inspectors for verification{'\n'}
            • Keep your device screen bright for better scanning{'\n'}
            • This QR code is valid until the expiry date shown above
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ width: '100%' }}>
          {/* Download Button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: getColor('primary.500'),
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={handleDownloadQR}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>Saving...</Text>
              </>
            ) : (
              <>
                <Ionicons name="download-outline" size={22} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>Download QR Code</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Share Button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: getColor('primary.500'),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleShareQR}
            disabled={isSharing}
            activeOpacity={0.8}
          >
            {isSharing ? (
              <>
                <ActivityIndicator size="small" color={getColor('primary.500')} />
                <Text style={{ color: getColor('primary.500'), fontSize: 16, fontWeight: '700', marginLeft: 8 }}>Sharing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="share-social-outline" size={22} color={getColor('primary.500')} />
                <Text style={{ color: getColor('primary.500'), fontSize: 16, fontWeight: '700', marginLeft: 8 }}>Share Details</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseScreenLayout>
  );
}
