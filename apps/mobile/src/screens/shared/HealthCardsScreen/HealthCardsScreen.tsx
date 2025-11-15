import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmptyState } from '@shared/components';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useHealthCards, BackendHealthCard } from '@features/healthCards';
import { Id } from '@backend/convex/_generated/dataModel';
import { theme } from '@shared/styles/theme';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { 
  getCardColor, 
  getCardStatus, 
  getStatusColor, 
  generateVerificationUrl, 
  formatDate, 
  generateCardHtml
} from '@features/healthCards';


export function HealthCardsScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
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
        message: `Health Card Verification\n\nCard ID: ${card.registrationNumber}\nStatus: ${status}\nExpiry: ${formatDate(card.expiryDate)}\n\nVerify at: ${verificationUrl}`,
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

  const handlePrintCard = async (card: BackendHealthCard) => {
    try {
      setPrintingCard(card._id);
      
      const cardHtml = generateCardHtml(card);
      
      // Generate PDF with proper landscape dimensions for ID card (11" x 3.5" landscape)
      const { uri } = await Print.printToFileAsync({ 
        html: cardHtml,
        // Exact fold-container dimensions in pixels
        width: 640,
        height: 448,
      });
      
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
      <BaseScreen safeArea={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Health Cards</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Loading health cards...</Text>
          </View>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Health Cards</Text>
            <Text style={styles.headerSubtitle}>
              {userHealthCards?.length || 0} {userHealthCards?.length === 1 ? 'card' : 'cards'} available
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {userHealthCards && userHealthCards.length > 0 ? (
            userHealthCards.map((card) => {
              const status = getCardStatus(card);
              const cardColor = getCardColor(card.jobCategory);
              const verificationUrl = generateVerificationUrl(card);
            
            return (
              <View key={card._id} style={styles.cardContainer}>
                {/* Card Header with Category and Status */}
                <View style={[styles.cardHeader, { backgroundColor: cardColor }]}>
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons name="shield-checkmark" size={moderateScale(24)} color="#FFFFFF" />
                    <Text style={styles.cardType}>
                      {card.jobCategory?.name || 'Health Card'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                    <Text style={styles.statusText}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  {/* Card ID Section */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>Card ID</Text>
                    <Text style={styles.cardId}>{card.registrationNumber || (card as any).verificationToken}</Text>
                  </View>

                  {/* Dates Section */}
                  <View style={styles.datesRow}>
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Issued</Text>
                      <Text style={styles.dateValue}>{formatDate(card.issuedDate || (card as any).issuedAt)}</Text>
                    </View>
                    <View style={styles.dateDivider} />
                    <View style={styles.dateItem}>
                      <Text style={styles.dateLabel}>Expires</Text>
                      <Text style={styles.dateValue}>{formatDate(card.expiryDate || (card as any).expiresAt)}</Text>
                    </View>
                  </View>

                  {/* QR Code Section */}
                  <TouchableOpacity
                    style={styles.qrCodeSection}
                    onPress={() => setSelectedCard(selectedCard === card._id ? null : card._id)}
                    activeOpacity={0.7}
                  >
                    {selectedCard === card._id ? (
                      <View style={styles.qrCodeActive}>
                        <View style={styles.qrCodeWrapper}>
                          <QRCode
                            value={verificationUrl}
                            size={moderateScale(160)}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.qrCodeActiveText}>Scan this code for verification</Text>
                      </View>
                    ) : (
                      <View style={styles.qrCodePlaceholder}>
                        <View style={styles.qrIconContainer}>
                          <Ionicons name="qr-code-outline" size={moderateScale(48)} color={theme.colors.primary[500]} />
                        </View>
                        <Text style={styles.qrPlaceholderText}>Tap to view QR</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareCard(card)}
                    disabled={sharingCard === card._id}
                    activeOpacity={0.7}
                  >
                    {sharingCard === card._id ? (
                      <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                    ) : (
                      <Ionicons name="share-social-outline" size={moderateScale(20)} color={theme.colors.primary[500]} />
                    )}
                    <Text style={styles.actionButtonText}>
                      {sharingCard === card._id ? 'Sharing...' : 'Share'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePrintCard(card)}
                    disabled={printingCard === card._id}
                    activeOpacity={0.7}
                  >
                    {printingCard === card._id ? (
                      <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                    ) : (
                      <Ionicons name="print-outline" size={moderateScale(20)} color={theme.colors.primary[500]} />
                    )}
                    <Text style={styles.actionButtonText}>
                      {printingCard === card._id ? 'Printing...' : 'Print'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Renew Button for Expired or Expiring Soon Cards */}
                {(status === 'expired' || (card as any).daysUntilExpiry <= 30) && (
                  <TouchableOpacity
                    style={styles.renewButton}
                    onPress={() => router.push('/(screens)/(shared)/renewal/select-card')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={moderateScale(20)} color="#FFFFFF" />
                    <Text style={styles.renewButtonText}>Renew Health Card</Text>
                  </TouchableOpacity>
                )}
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
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.colors.ui.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(12),
  },
  cardContainer: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  cardType: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardBody: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  infoSection: {
    marginBottom: verticalScale(16),
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(6),
  },
  cardId: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  datesRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[50],
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateDivider: {
    width: 1,
    backgroundColor: theme.colors.gray[200],
    marginHorizontal: scale(16),
  },
  dateLabel: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(4),
  },
  dateValue: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  qrCodeSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  qrCodeActive: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: scale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodeActiveText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(12),
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(32),
  },
  qrIconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  qrPlaceholderText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: theme.colors.primary[500],
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    gap: scale(6),
  },
  actionButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: verticalScale(14),
    marginHorizontal: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  renewButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: verticalScale(20),
  },
});
