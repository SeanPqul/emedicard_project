import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Id } from '../../../../../backend/convex/_generated/dataModel';
import { CustomButton, EmptyState } from '@/src/shared/components';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { styles } from '../../../src/styles/screens/shared-orientation';
import { getColor } from '../../../src/styles/theme';
import {
  formatOrientationDate,
  formatTime,
  getOrientationStatus,
  getOrientationStatusColor,
  getStatusText
} from '../../../src/utils';
// TODO: Implement useOrientations hook or replace with proper API calls

export default function OrientationScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // TODO: Replace with proper API hook implementation
  const orientations = []; // Placeholder - implement useOrientations hook
  const isLoading = false;
  
  // Placeholder functions - implement with proper API calls
  const updateCheckIn = async (data: any) => {
    console.log('Check-in:', data);
    // TODO: Implement actual check-in API call
  };
  
  const updateCheckOut = async (data: any) => {
    console.log('Check-out:', data);
    // TODO: Implement actual check-out API call
  };
  
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
  
  
  const renderOrientationCard = (orientation: any) => {
    const status = getOrientationStatus(orientation);
    const statusColor = getOrientationStatusColor(status);
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
              <Text style={styles.cardSubtitle}>{formatOrientationDate(orientation.scheduleAt)}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.scheduleInfo}>
            <View style={styles.scheduleItem}>
              <Ionicons name="time-outline" size={16} color={getColor('text.secondary')} />
              <Text style={styles.scheduleText}>Scheduled: {formatTime(orientation.scheduleAt)}</Text>
            </View>
            
            {orientation.checkInTime && (
              <View style={styles.scheduleItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={getColor('success.main')} />
                <Text style={styles.scheduleText}>Checked In: {formatTime(orientation.checkInTime)}</Text>
              </View>
            )}
            
            {orientation.checkOutTime && (
              <View style={styles.scheduleItem}>
                <Ionicons name="checkmark-done-circle-outline" size={16} color={getColor('success.main')} />
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
                <Ionicons name="checkmark-circle" size={20} color={getColor('success.main')} />
                <Text style={styles.completionText}>Orientation Completed</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <BaseScreenLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Loading orientations...</Text>
        </View>
      </BaseScreenLayout>
    );
  }
  
  return (
    <BaseScreenLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orientation</Text>
        <View style={styles.headerSpacer} />
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
            actionText="View Applications"
            onActionPress={() => router.push('/(tabs)/application')}
          />
        )}
        
        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Orientation</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle-outline" size={20} color={getColor('primary.main')} />
              <Text style={styles.infoText}>Orientation is mandatory for all food handler positions</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={getColor('primary.main')} />
              <Text style={styles.infoText}>Sessions typically last 2-3 hours</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="qr-code-outline" size={20} color={getColor('primary.main')} />
              <Text style={styles.infoText}>Use QR code to check in and out</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="document-text-outline" size={20} color={getColor('primary.main')} />
              <Text style={styles.infoText}>Completion certificate issued after successful attendance</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </BaseScreenLayout>
  );
}


