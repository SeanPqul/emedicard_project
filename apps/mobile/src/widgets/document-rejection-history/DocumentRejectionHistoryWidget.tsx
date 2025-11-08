import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@shared/components';
import { DocumentRejectionWidget } from '@widgets/document-rejection';
import { styles } from './DocumentRejectionHistoryWidget.styles';
import { moderateScale } from '@shared/utils/responsive';
import { EnrichedRejection, RejectionCategory } from '@entities/document/model/rejection-types';
import { EnrichedReferral } from '@entities/document/model/referral-types';
import { getRejectionCategoryLabel } from '@entities/document/model/rejection-constants';

// Filter categories
const FILTER_CATEGORIES: Array<{ key: RejectionCategory | 'all'; label: string; icon: string }> = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: RejectionCategory.QUALITY_ISSUE, label: 'Quality', icon: 'image' },
  { key: RejectionCategory.WRONG_DOCUMENT, label: 'Wrong Doc', icon: 'close-circle' },
  { key: RejectionCategory.EXPIRED_DOCUMENT, label: 'Expired', icon: 'calendar' },
  { key: RejectionCategory.INCOMPLETE_DOCUMENT, label: 'Incomplete', icon: 'document-text' },
];

interface DocumentRejectionHistoryWidgetProps {
  rejections: (EnrichedRejection | EnrichedReferral)[]; // Phase 4: Support both types
  documentTypes: Record<string, string>; // Map of documentTypeId to name
  selectedFilter: RejectionCategory | 'all';
  isLoading: boolean;
  isRefreshing: boolean;
  onFilterChange: (filter: RejectionCategory | 'all') => void;
  onRefresh: () => void;
  onResubmit: (rejection: EnrichedRejection | EnrichedReferral) => void;
  onViewDetails: (rejection: EnrichedRejection | EnrichedReferral) => void;
}

export function DocumentRejectionHistoryWidget({
  rejections,
  documentTypes,
  selectedFilter,
  isLoading,
  isRefreshing,
  onFilterChange,
  onRefresh,
  onResubmit,
  onViewDetails,
}: DocumentRejectionHistoryWidgetProps) {
  
  // Group rejections by date
  // Phase 4: Handle both old and new types
  const groupedRejections = React.useMemo(() => {
    const groups: Record<string, (EnrichedRejection | EnrichedReferral)[]> = {};
    
    const filteredRejections = selectedFilter === 'all' 
      ? rejections 
      : rejections.filter(r => {
          // Check if it's old rejection type
          if ('rejectionCategory' in r) {
            return r.rejectionCategory === selectedFilter;
          }
          // New referral type - no filtering by category yet
          return false;
        });
    
    filteredRejections.forEach(rejection => {
      // Phase 4: Get date from either rejectedAt or referredAt
      const timestamp = 'rejectedAt' in rejection ? rejection.rejectedAt : rejection.referredAt;
      const date = new Date(timestamp);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(rejection);
    });
    
    return groups;
  }, [rejections, selectedFilter]);

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Referral History</Text>
        
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {FILTER_CATEGORIES.map((category) => {
              const isActive = selectedFilter === category.key;
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => onFilterChange(category.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="checkmark-circle-outline"
          title="No Rejections"
          subtitle={
            selectedFilter === 'all'
              ? "Great! You don't have any rejected documents."
              : `No documents rejected for ${getRejectionCategoryLabel(selectedFilter as RejectionCategory)}.`
          }
        />
      </View>
    );
  };

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderLoading()}
      </View>
    );
  }

  const dateKeys = Object.keys(groupedRejections).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {dateKeys.length === 0 ? (
          renderEmptyState()
        ) : (
          dateKeys.map((dateKey) => (
            <View key={dateKey} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{dateKey}</Text>
              {groupedRejections[dateKey]?.map((rejection) => (
                <View key={rejection._id} style={styles.rejectionItemContainer}>
                  <DocumentRejectionWidget
                    rejection={rejection}
                    documentName={rejection.documentTypeName || 'Unknown Document'}
                    onResubmit={() => onResubmit(rejection)}
                    onViewDetails={() => onViewDetails(rejection)}
                  />
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
