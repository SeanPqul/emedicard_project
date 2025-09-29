import React from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { BaseScreenLayout } from '../../shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import QRCode from 'react-native-qrcode-svg';
import { getColor } from '../../shared/styles/theme';
import { styles } from '../../shared/styles/screens/shared-qr-code';

export function QRCodeScreen() {
  // TODO: Replace mock data with actual health card data from API
  const healthCard = {
    id: 'HC-FH-2024-001',
    type: 'Food Handler',
    holderName: 'John Doe',
    expiryDate: '2025-01-15',
    issuedBy: 'Davao City Health Office',
  };

  const handleShareQR = async () => {
    try {
      const result = await Share.share({
        message: `Health Card QR Code\nID: ${healthCard.id}\nType: ${healthCard.type}\nExpiry: ${healthCard.expiryDate}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const handleScanQR = () => {
    router.push('/qr-scanner');
  };

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

      <View style={styles.content}>
        {/* QR Code Container */}
        <View style={styles.qrContainer}>
          <QRCode
            value={healthCard.id}
            size={200}
            color="#000000"
            backgroundColor="#FFFFFF"
          />
        </View>

        {/* Card Information */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{healthCard.type} Health Card</Text>
          <Text style={styles.cardId}>ID: {healthCard.id}</Text>
          <Text style={styles.cardDetail}>Holder: {healthCard.holderName}</Text>
          <Text style={styles.cardDetail}>Expires: {healthCard.expiryDate}</Text>
          <Text style={styles.cardDetail}>Issued by: {healthCard.issuedBy}</Text>
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
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleScanQR}>
            <Ionicons name="scan" size={20} color={getColor('primary.main')} />
            <Text style={styles.actionButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
            <Ionicons name="share-outline" size={20} color={getColor('primary.main')} />
            <Text style={styles.actionButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseScreenLayout>
  );
}
