import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { BaseScreenLayout } from '@/src/shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { QRCodeScanner } from '@features/scanner/components';
import { styles } from '@shared/styles/screens/shared-qr-scanner';

export function QrScannerScreen() {
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