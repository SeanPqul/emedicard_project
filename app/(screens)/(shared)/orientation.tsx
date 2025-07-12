import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CustomButton } from '../../../src/components';

export default function OrientationScreen() {

  return (
    <BaseScreenLayout>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orientation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Ionicons name="calendar-outline" size={24} color="#2E86AB" />
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Orientation Schedule</Text>
            <Text style={styles.sectionSubtitle}>You have no scheduled orientations.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Ionicons name="qr-code-outline" size={24} color="#2E86AB" />
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Check In/Out</Text>
            <Text style={styles.sectionSubtitle}>Scan QR code upon entering and leaving.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Ionicons name="document-text-outline" size={24} color="#2E86AB" />
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Completion Certificate</Text>
            <Text style={styles.sectionSubtitle}>Receive your completion certificate after orientation.</Text>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
});

