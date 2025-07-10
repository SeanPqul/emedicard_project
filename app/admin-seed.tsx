import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AdminSeed() {
  const [isLoading, setIsLoading] = useState(false);
  const seedJobCategories = useMutation(api.seedData.seedJobCategories);

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const result = await seedJobCategories();
      Alert.alert(
        'Success', 
        result.message,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to seed data: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin - Seed Database</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={32} color="#F18F01" />
          <Text style={styles.warningTitle}>Database Seeding</Text>
          <Text style={styles.warningText}>
            This will populate the database with default job categories for health cards:
          </Text>
        </View>

        <View style={styles.categoryList}>
          <View style={styles.categoryItem}>
            <View style={[styles.colorIndicator, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.categoryText}>Food Handler (Yellow Card)</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.colorIndicator, { backgroundColor: '#008000' }]} />
            <Text style={styles.categoryText}>General Worker (Green Card)</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.colorIndicator, { backgroundColor: '#FF69B4' }]} />
            <Text style={styles.categoryText}>Skin-to-Skin Contact (Pink Card)</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.seedButton, isLoading && styles.disabledButton]} 
          onPress={handleSeedData}
          disabled={isLoading}
        >
          <Text style={styles.seedButtonText}>
            {isLoading ? 'Seeding...' : 'Seed Database'}
          </Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F18F01',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#856404',
    marginTop: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  seedButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  disabledButton: {
    backgroundColor: '#6C757D',
  },
  seedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
