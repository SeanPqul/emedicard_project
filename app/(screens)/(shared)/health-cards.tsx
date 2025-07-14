import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert, Platform, Linking } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { EmptyState, CustomButton } from '../../../src/components';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { Id } from '../../../convex/_generated/dataModel';

interface HealthCardData {
  _id: string;
  formId: string;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
  form?: any;
  jobCategory?: any;
}

export default function HealthCardsScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [downloadingCard, setDownloadingCard] = useState<string | null>(null);
  const [printingCard, setPrintingCard] = useState<string | null>(null);
  const [sharingCard, setSharingCard] = useState<string | null>(null);

  // Convex queries
  const userHealthCards = useQuery(api.healthCards.getUserHealthCards);
  const createVerificationLog = useMutation(api.verificationLogs.createVerificationLog);

  const getCardColor = (jobCategory: any) => {
    if (jobCategory?.colorCode) {
      return jobCategory.colorCode;
    }
    // Fallback colors
    if (jobCategory?.name.toLowerCase().includes('food')) {
      return '#FFD700';
    } else if (jobCategory?.name.toLowerCase().includes('security')) {
      return '#4169E1';
    }
    return '#6B46C1';
  };

  const getCardStatus = (card: HealthCardData) => {
    const now = Date.now();
    if (card.expiresAt < now) {
      return 'expired';
    }
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#28A745';
      case 'expired':
        return '#DC3545';
      case 'pending':
        return '#FFC107';
      default:
        return '#6C757D';
    }
  };

  const generateVerificationUrl = (card: HealthCardData) => {
    return `https://yourdomain.com/verify/${card.verificationToken}`;
  };

  const handleShareCard = async (card: HealthCardData) => {
    try {
      setSharingCard(card._id);
      const verificationUrl = generateVerificationUrl(card);
      const status = getCardStatus(card);
      
      const result = await Share.share({
        message: `Health Card Verification\n\nCard ID: ${card.verificationToken}\nStatus: ${status}\nExpiry: ${formatDate(card.expiresAt)}\n\nVerify at: ${verificationUrl}`,
        url: verificationUrl,
      });
      
      if (result.action === Share.sharedAction) {
        // Log the share activity
        await createVerificationLog({
          healthCardId: card._id as Id<"healthCards">,
          userAgent: `Mobile App - Share`,
          ipAddress: undefined,
        });
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
    } finally {
      setSharingCard(null);
    }
  };

  const handleDownloadCard = async (card: HealthCardData) => {
    try {
      setDownloadingCard(card._id);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access media library is required to download cards.');
        return;
      }

      // Generate card as image using view-shot
      const cardHtml = generateCardHtml(card);
      const { uri } = await Print.printToFileAsync({ html: cardHtml });
      
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Health Cards', asset, false);
      
      Alert.alert('Success', 'Health card downloaded to your gallery!');
    } catch (error) {
      console.error('Error downloading card:', error);
      Alert.alert('Error', 'Failed to download card. Please try again.');
    } finally {
      setDownloadingCard(null);
    }
  };

  const handlePrintCard = async (card: HealthCardData) => {
    try {
      setPrintingCard(card._id);
      
      const cardHtml = generateCardHtml(card);
      
      const { uri } = await Print.printToFileAsync({ html: cardHtml });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Print', 'Generated PDF ready for printing!');
      }
    } catch (error) {
      console.error('Error printing card:', error);
      Alert.alert('Error', 'Failed to generate printable card. Please try again.');
    } finally {
      setPrintingCard(null);
    }
  };

  const generateCardHtml = (card: HealthCardData) => {
    const status = getCardStatus(card);
    const verificationUrl = generateVerificationUrl(card);
    
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .card { 
              width: 300px; 
              height: 200px; 
              border: 2px solid #333; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 0 auto;
              background: linear-gradient(135deg, ${getCardColor(card.jobCategory)}, ${getCardColor(card.jobCategory)}dd);
              color: white;
              position: relative;
            }
            .card-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .card-id { font-size: 14px; margin-bottom: 5px; }
            .card-dates { font-size: 12px; margin-bottom: 5px; }
            .qr-code { position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; }
            .status { 
              position: absolute; 
              top: 10px; 
              right: 10px; 
              background: ${getStatusColor(status)}; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 10px;
            }
            .verification-url { font-size: 10px; position: absolute; bottom: 10px; left: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="status">${status.toUpperCase()}</div>
            <div class="card-header">${card.jobCategory?.name || 'Health Card'}</div>
            <div class="card-id">ID: ${card.verificationToken}</div>
            <div class="card-dates">Issued: ${formatDate(card.issuedAt)}</div>
            <div class="card-dates">Expires: ${formatDate(card.expiresAt)}</div>
            <div class="verification-url">Verify: ${verificationUrl}</div>
          </div>
        </body>
      </html>
    `;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <BaseScreenLayout>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Cards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {userHealthCards && userHealthCards.length > 0 ? (
          userHealthCards.map((card) => {
            const status = getCardStatus(card);
            const cardColor = getCardColor(card.jobCategory);
            const verificationUrl = generateVerificationUrl(card);
            
            return (
              <View key={card._id} style={styles.cardContainer}>
                <View style={[styles.cardHeader, { backgroundColor: cardColor }]}>
                  <Text style={styles.cardType}>
                    {card.jobCategory?.name || 'Health Card'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                    <Text style={styles.statusText}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardId}>Card ID: {card.verificationToken}</Text>
                    <Text style={styles.cardDates}>
                      Issued: {formatDate(card.issuedAt)}
                    </Text>
                    <Text style={styles.cardDates}>
                      Expires: {formatDate(card.expiresAt)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.qrCodeContainer}
                    onPress={() => setSelectedCard(selectedCard === card._id ? null : card._id)}
                  >
                    {selectedCard === card._id ? (
                      <View style={styles.qrCodeWrapper}>
                        <QRCode
                          value={verificationUrl}
                          size={120}
                          color="#000000"
                          backgroundColor="#FFFFFF"
                        />
                      </View>
                    ) : (
                      <View style={styles.qrCodePlaceholder}>
                        <Ionicons name="qr-code-outline" size={48} color="#6C757D" />
                        <Text style={styles.qrCodeText}>Tap to view QR</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareCard(card)}
                    disabled={sharingCard === card._id}
                  >
                    <Ionicons name="share-outline" size={20} color="#2E86AB" />
                    <Text style={styles.actionButtonText}>
                      {sharingCard === card._id ? 'Sharing...' : 'Share'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadCard(card)}
                    disabled={downloadingCard === card._id}
                  >
                    <Ionicons name="download-outline" size={20} color="#2E86AB" />
                    <Text style={styles.actionButtonText}>
                      {downloadingCard === card._id ? 'Downloading...' : 'Download'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePrintCard(card)}
                    disabled={printingCard === card._id}
                  >
                    <Ionicons name="print-outline" size={20} color="#2E86AB" />
                    <Text style={styles.actionButtonText}>
                      {printingCard === card._id ? 'Printing...' : 'Print'}
                    </Text>
                  </TouchableOpacity>

                  {status === 'expired' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.renewButton]}
                      onPress={() => router.push('/(tabs)/apply')}
                    >
                      <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                      <Text style={[styles.actionButtonText, styles.renewButtonText]}>Renew</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            icon="shield-outline"
            title="No Health Cards"
            subtitle="You don't have any health cards yet."
            buttonText="Apply for Health Card"
            onButtonPress={() => router.push('/(tabs)/apply')}
          />
        )}
      </ScrollView>
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
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardDates: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  qrCodeWrapper: {
    padding: 8,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#2E86AB',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
    marginLeft: 4,
  },
  renewButton: {
    backgroundColor: '#2E86AB',
  },
  renewButtonText: {
    color: '#FFFFFF',
  },
});
