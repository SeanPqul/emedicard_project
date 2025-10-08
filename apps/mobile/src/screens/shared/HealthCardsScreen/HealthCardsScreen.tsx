import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { BaseScreenLayout } from '@/src/shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmptyState } from '@shared/components';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { useHealthCards, BackendHealthCard } from '@features/healthCards';
import { Id } from '@backend/convex/_generated/dataModel';
import { getColor } from '@shared/styles/theme';
import { styles } from '@shared/styles/screens/shared-health-cards';
import { 
  getCardColor, 
  getCardStatus, 
  getStatusColor, 
  generateVerificationUrl, 
  formatDate, 
  generateCardHtml
} from '@features/healthCards/lib';
import { HealthCardsHeader } from './HealthCardsHeader';


export function HealthCardsScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [downloadingCard, setDownloadingCard] = useState<string | null>(null);
  const [printingCard, setPrintingCard] = useState<string | null>(null);
  const [sharingCard, setSharingCard] = useState<string | null>(null);

  // Use our new simplified hook
  const { data: userHealthCards, isLoading, mutations: { createVerificationLog } } = useHealthCards();


  const handleShareCard = async (card: BackendHealthCard) => {
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
          location: 'Mobile App - Share',
          notes: 'Card shared from mobile app',
        });
      }
    } catch (error) {
      console.error('Error sharing card:', error);
      Alert.alert('Error', 'Failed to share card. Please try again.');
    } finally {
      setSharingCard(null);
    }
  };

  const handleDownloadCard = async (card: BackendHealthCard) => {
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

  const handlePrintCard = async (card: BackendHealthCard) => {
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


  // Show loading state
  if (isLoading) {
    return (
      <BaseScreenLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Loading health cards...</Text>
        </View>
      </BaseScreenLayout>
    );
  }

  return (
    <BaseScreenLayout>
      {/* Green Branded Header */}
      <HealthCardsHeader
        cardCount={userHealthCards?.length || 0}
      />

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
                        <Ionicons name="qr-code-outline" size={48} color={getColor('text.secondary')} />
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
                    <Ionicons name="share-outline" size={20} color={getColor('primary.main')} />
                    <Text style={styles.actionButtonText}>
                      {sharingCard === card._id ? 'Sharing...' : 'Share'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadCard(card)}
                    disabled={downloadingCard === card._id}
                  >
                    <Ionicons name="download-outline" size={20} color={getColor('primary.main')} />
                    <Text style={styles.actionButtonText}>
                      {downloadingCard === card._id ? 'Downloading...' : 'Download'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePrintCard(card)}
                    disabled={printingCard === card._id}
                  >
                    <Ionicons name="print-outline" size={20} color={getColor('primary.main')} />
                    <Text style={styles.actionButtonText}>
                      {printingCard === card._id ? 'Printing...' : 'Print'}
                    </Text>
                  </TouchableOpacity>

                  {status === 'expired' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.renewButton]}
                      onPress={() => router.push('/(tabs)/apply')}
                    >
                      <Ionicons name="refresh-outline" size={20} color={getColor('text.white')} />
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
            actionText="Apply for Health Card"
            onActionPress={() => router.push('/(tabs)/apply')}
          />
        )}
      </ScrollView>
    </BaseScreenLayout>
  );
}