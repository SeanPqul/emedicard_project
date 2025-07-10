import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { EmptyState } from '../src/components';
import QRCode from 'react-native-qrcode-svg';

interface HealthCard {
  id: string;
  type: 'food_handler' | 'security_guard';
  status: 'active' | 'expired' | 'pending';
  issuedDate: string;
  expiryDate: string;
  qrCodeData: string;
}

export default function HealthCardsScreen() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Mock data - replace with Convex query
  const userHealthCards: HealthCard[] = [
    {
      id: '1',
      type: 'food_handler',
      status: 'active',
      issuedDate: '2024-01-15',
      expiryDate: '2025-01-15',
      qrCodeData: 'HC-FH-2024-001',
    },
    {
      id: '2',
      type: 'security_guard',
      status: 'expired',
      issuedDate: '2023-06-10',
      expiryDate: '2024-06-10',
      qrCodeData: 'HC-SG-2023-002',
    },
  ];

  const getCardColor = (type: string) => {
    switch (type) {
      case 'food_handler':
        return '#FFD700';
      case 'security_guard':
        return '#4169E1';
      default:
        return '#6B46C1';
    }
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

  const handleShareCard = async (card: HealthCard) => {
    try {
      const result = await Share.share({
        message: `Health Card: ${card.qrCodeData}\nStatus: ${card.status}\nExpiry: ${card.expiryDate}`,
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Cards</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {userHealthCards.length > 0 ? (
          userHealthCards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <View style={[styles.cardHeader, { backgroundColor: getCardColor(card.type) }]}>
                <Text style={styles.cardType}>
                  {card.type === 'food_handler' ? 'Food Handler' : 'Security Guard'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(card.status) }]}>
                  <Text style={styles.statusText}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardId}>Card ID: {card.qrCodeData}</Text>
                  <Text style={styles.cardDates}>
                    Issued: {formatDate(card.issuedDate)}
                  </Text>
                  <Text style={styles.cardDates}>
                    Expires: {formatDate(card.expiryDate)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.qrCodeContainer}
                  onPress={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                >
                  {selectedCard === card.id ? (
                    <View style={styles.qrCodeWrapper}>
                      <QRCode
                        value={card.qrCodeData}
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
                >
                  <Ionicons name="share-outline" size={20} color="#2E86AB" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {/* Download logic */}}
                >
                  <Ionicons name="download-outline" size={20} color="#2E86AB" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>

                {card.status === 'expired' && (
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
          ))
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
    </SafeAreaView>
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
