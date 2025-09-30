import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { useApplicationList } from '@/src/features/application/hooks';
import { ApplicationListWidget } from '@/src/widgets/application-list';
import { theme } from '@/src/shared/styles/theme';

/**
 * ApplicationListScreen - Thin orchestrator following FSD pattern
 * 
 * This screen only handles:
 * - Loading states
 * - Delegating to ApplicationListWidget
 * 
 * Following the same pattern as DashboardScreen
 */
export function ApplicationListScreen() {
  const {
    applications,
    isLoading,
    searchQuery,
    selectedFilter,
    selectedSort,
    refreshing,
    showFilters,
    setSearchQuery,
    setSelectedFilter,
    setSelectedSort,
    setShowFilters,
    onRefresh,
    getStatusIcon,
    getStatusDescription,
    getProgressPercentage,
    getProgressText,
  } = useApplicationList();

  if (isLoading) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <ApplicationListWidget
        applications={applications}
        refreshing={refreshing}
        searchQuery={searchQuery}
        selectedFilter={selectedFilter}
        selectedSort={selectedSort}
        showFilters={showFilters}
        onRefresh={onRefresh}
        onSearchChange={setSearchQuery}
        onFilterChange={setSelectedFilter}
        onSortChange={setSelectedSort}
        onToggleFilters={() => setShowFilters(!showFilters)}
        getStatusIcon={getStatusIcon}
        getStatusDescription={getStatusDescription}
        getProgressPercentage={getProgressPercentage}
        getProgressText={getProgressText}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
