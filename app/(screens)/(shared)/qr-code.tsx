import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeScreen() {
  // Mock data - replace with actual health card data
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
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Card QR</Text>
        <TouchableOpacity onPress={handleShareQR}>
          <Ionicons name="share-outline" size={24} color="#212529" />
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
            <Ionicons name="scan" size={20} color="#2E86AB" />
            <Text style={styles.actionButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
            <Ionicons name="share-outline" size={20} color="#2E86AB" />
            <Text style={styles.actionButtonText}>Share QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  cardInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  cardId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 16,
  },
  cardDetail: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 4,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E86AB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
    marginLeft: 8,
  },
});
