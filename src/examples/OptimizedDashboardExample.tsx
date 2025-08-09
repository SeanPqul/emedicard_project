import React from 'react';
import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { useOptimizedDashboard } from '../hooks/useOptimizedDashboard';
import { useDeferredLoading, LoadingStrategies } from '../lib/performance/deferredLoading';
import { StatCard, ActivityItem, EmptyState } from '../components';

/**
 * Example implementation showing mobile optimization patterns:
 * 
 * 1. ✅ Reduced payloads at Convex function level
 * 2. ✅ Aggregated server-side queries to minimize round-trips  
 * 3. ✅ Parallelized independent queries with Promise.all
 * 4. ✅ Cached stable lists (job categories) in MMKV with version invalidation
 * 5. ✅ Deferred non-critical calls until after first paint
 * 6. ✅ Network-aware loading (Wi-Fi vs cellular considerations)
 */
export function OptimizedDashboardExample() {
  // Use optimized dashboard hook with MMKV caching and parallel queries
  const {
    user,
    userProfile,
    userApplications,
    dashboardStats,
    recentActivities,
    jobCategories,
    isConnected,
    isWifiConnected,
    isLoading,
    refreshing,
    onRefresh,
    getGreeting,
    cacheStats,
  } = useOptimizedDashboard();

  // Defer heavy operations until after first paint and on Wi-Fi
  const { shouldLoad: shouldLoadHeavyContent } = useDeferredLoading(
    LoadingStrategies.WIFI_ONLY_HEAVY
  );

  // Defer background analytics until app is idle
  const { shouldLoad: shouldLoadAnalytics } = useDeferredLoading(
    LoadingStrategies.BACKGROUND
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading optimized dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with greeting */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          Good {getGreeting()}, {userProfile?.fullname || user?.firstName}!
        </Text>
        
        {/* Network status indicator */}
        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {isWifiConnected ? '📶 Wi-Fi Connected' : isConnected ? '📱 Cellular' : '❌ Offline'}
        </Text>
      </View>

      {/* Dashboard stats - loaded from pre-calculated server values */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
        <StatCard
          title="Active Applications"
          value={dashboardStats.activeApplications}
          color="#4CAF50"
        />
        <StatCard
          title="Pending Payments"
          value={`₱${dashboardStats.pendingAmount.toFixed(2)}`}
          color="#FF9800"
        />
        <StatCard
          title="Valid Cards"
          value={dashboardStats.validHealthCards}
          color="#2196F3"
        />
      </View>

      {/* Recent activities - pre-filtered on server */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Recent Activities
        </Text>
        {recentActivities.length > 0 ? (
          recentActivities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <EmptyState message="No recent activities" />
        )}
      </View>

      {/* Applications - with minimal payload */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Your Applications
        </Text>
        {userApplications?.map(application => (
          <View key={application._id} style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 12, 
            borderRadius: 8,
            marginBottom: 8 
          }}>
            <Text style={{ fontWeight: 'bold' }}>
              {application.form.position} - {application.form.organization}
            </Text>
            <Text style={{ color: '#666' }}>
              Status: {application.status}
            </Text>
            {application.jobCategory && (
              <Text style={{ 
                color: application.jobCategory.colorCode || '#333',
                fontSize: 12,
                marginTop: 4 
              }}>
                Category: {application.jobCategory.name}
              </Text>
            )}
            <Text style={{ fontSize: 12, color: '#999' }}>
              Documents: {application.documentCount}
            </Text>
          </View>
        ))}
      </View>

      {/* Cached job categories - loaded from MMKV */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
          Available Job Categories (Cached)
        </Text>
        {jobCategories.map(category => (
          <View key={category._id} style={{
            backgroundColor: category.colorCode + '20',
            padding: 8,
            borderRadius: 4,
            marginBottom: 4,
            borderLeftWidth: 3,
            borderLeftColor: category.colorCode,
          }}>
            <Text style={{ fontWeight: 'bold' }}>{category.name}</Text>
            {category.requireOrientation && (
              <Text style={{ fontSize: 12, color: '#666' }}>
                Requires orientation
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Heavy content - only loaded on Wi-Fi */}
      {shouldLoadHeavyContent && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Detailed Analytics (Wi-Fi Only)
          </Text>
          <Text>Heavy charts and analytics would load here...</Text>
        </View>
      )}

      {/* Background analytics - deferred until idle */}
      {shouldLoadAnalytics && (
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Background Analytics Loaded
          </Text>
          <Text style={{ fontSize: 12 }}>
            Cache Stats: {JSON.stringify(cacheStats, null, 2)}
          </Text>
        </View>
      )}

      {/* Development info */}
      {__DEV__ && (
        <View style={{ padding: 16, backgroundColor: '#f0f0f0', margin: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
            Mobile Optimization Status:
          </Text>
          <Text style={{ fontSize: 12 }}>
            ✅ Minimal payloads from server{'\n'}
            ✅ Server-side aggregation{'\n'}
            ✅ MMKV caching for job categories{'\n'}
            ✅ Deferred heavy content loading{'\n'}
            ✅ Network-aware refresh strategy{'\n'}
            ✅ Parallel query execution
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
