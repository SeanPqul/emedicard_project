import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CustomButton, EmptyState } from '../../../src/components';
import { Id } from '../../../convex/_generated/dataModel';
import QRCode from 'react-native-qrcode-svg';

export default function OrientationScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // Convex queries and mutations
  const orientations = useQuery(api.orientations.getUserOrientations);
  const orientationForForm = useQuery(
    api.orientations.getOrientationByFormId,
    formId ? { formId: formId as Id<"forms"> } : "skip"
  );
  const updateCheckIn = useMutation(api.orientations.updateOrientationCheckIn);
  const updateCheckOut = useMutation(api.orientations.updateOrientationCheckOut);
  const completeOrientation = useMutation(api.orientations.completeOrientation);
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Queries will automatically refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleCheckIn = async (orientationId: Id<"orientations">) => {
    try {
      setCheckingIn(true);
      await updateCheckIn({
        orientationId,
        checkInTime: Date.now(),
      });
      Alert.alert('Success', 'Successfully checked in to orientation!');
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };
  
  const handleCheckOut = async (orientationId: Id<"orientations">) => {
    try {
      setCheckingOut(true);
      await updateCheckOut({
        orientationId,
        checkOutTime: Date.now(),
      });
      Alert.alert('Success', 'Successfully checked out from orientation!');
    } catch (error) {
      console.error('Check-out error:', error);
      Alert.alert('Error', 'Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getOrientationStatus = (orientation: any) => {
    if (orientation.checkInTime && orientation.checkOutTime) {
      return 'completed';
    } else if (orientation.checkInTime) {
      return 'in_progress';
    } else if (orientation.scheduleAt < Date.now()) {
      return 'missed';
    } else {
      return 'scheduled';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'missed':
        return '#EF4444';
      case 'scheduled':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'missed':
        return 'Missed';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Unknown';
    }
  };
  
  const renderOrientationCard = (orientation: any) => {
    const status = getOrientationStatus(orientation);
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);
    
    return (
      <View key={orientation._id} style={styles.orientationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.categoryIndicator, { backgroundColor: orientation.jobCategory?.colorCode + '20' }]}>
              <Ionicons 
                name={orientation.jobCategory?.name.toLowerCase().includes('food') ? 'restaurant' : 'shield'}
                size={16} 
                color={orientation.jobCategory?.colorCode}
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardTitle}>{orientation.jobCategory?.name} Orientation</Text>
              <Text style={styles.cardSubtitle}>{formatDate(orientation.scheduleAt)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.scheduleInfo}>
            <View style={styles.scheduleItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.scheduleText}>Scheduled: {formatTime(orientation.scheduleAt)}</Text>
            </View>
            
            {orientation.checkInTime && (
              <View style={styles.scheduleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                <Text style={styles.scheduleText}>Checked In: {formatTime(orientation.checkInTime)}</Text>
              </View>
            )}
            
            {orientation.checkOutTime && (
              <View style={styles.scheduleItem}>
                <Ionicons name="checkmark-done-circle-outline" size={16} color="#10B981" />
                <Text style={styles.scheduleText}>Checked Out: {formatTime(orientation.checkOutTime)}</Text>
              </View>
            )}
          </View>
          
          {/* QR Code for Check-in */}
          {status === 'scheduled' && orientation.scheduleAt <= Date.now() + (30 * 60 * 1000) && (
            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>Check-in QR Code</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={orientation.qrCodeUrl}
                  size={120}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrInstructions}>Present this QR code to the orientation staff</Text>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {status === 'scheduled' && orientation.scheduleAt <= Date.now() + (30 * 60 * 1000) && !orientation.checkInTime && (
              <CustomButton
                title={checkingIn ? 'Checking In...' : 'Check In'}
                onPress={() => handleCheckIn(orientation._id)}
                disabled={checkingIn}
                size="small"
                buttonStyle={styles.actionButton}
              />
            )}
            
            {status === 'in_progress' && !orientation.checkOutTime && (
              <CustomButton
                title={checkingOut ? 'Checking Out...' : 'Check Out'}
                onPress={() => handleCheckOut(orientation._id)}
                disabled={checkingOut}
                size="small"
                buttonStyle={[styles.actionButton, styles.checkOutButton]}
              />
            )}
            
            {status === 'completed' && (
              <View style={styles.completionBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.completionText}>Orientation Completed</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <BaseScreenLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orientation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orientations && orientations.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Your Orientations</Text>
            {orientations.map(renderOrientationCard)}
          </View>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Orientations Scheduled"
            subtitle="You don't have any orientations scheduled at the moment. Orientations are required for food handler positions."
            buttonText="View Applications"
            onButtonPress={() => router.push('/(tabs)/application')}
          />
        )}
        
        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Orientation</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>Orientation is mandatory for all food handler positions</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>Sessions typically last 2-3 hours</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="qr-code-outline" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>Use QR code to check in and out</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>Completion certificate issued after successful attendance</Text>
            </View>
          </View>
        </View>
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
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionText: {
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  orientationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  scheduleInfo: {
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
  },
  qrInstructions: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  checkOutButton: {
    backgroundColor: '#F59E0B',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 32,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
});

