import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { QRCodeScanner } from '../../../src/components/QRCodeScanner';

export default function QRScannerScreen() {
  const [scannerActive, setScannerActive] = useState(true);

  const handleScan = (data) => {
    const qrData = JSON.parse(data);
    Alert.alert(
      'QR Code Scanned',
      `Card ID: ${qrData.cardId}\nType: ${qrData.type}\nStatus: ${qrData.status}\nExpiry Date: ${qrData.expiryDate}`,
      [
        { text: 'OK', onPress: () => router.back() }
      ]
    );
  };

  const handleClose = () => {
    setScannerActive(false);
    router.back();
  };

  return (
    <BaseScreenLayout>
      <QRCodeScanner
        onScan={handleScan}
        onClose={handleClose}
        active={scannerActive}
        title='Scan Health Card'
        subtitle='Align the QR code within the frame to scan'
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scannerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});
