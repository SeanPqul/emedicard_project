import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useSegments, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUsers } from '@shared/hooks/useUsers';
import { useRoleBasedNavigation } from '@shared/hooks/useRoleBasedNavigation';
import { theme } from '@shared/styles/theme';

export default function NavigationHealthCheck() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: { currentUser }, isLoading } = useUsers();
  const { permissions, canAccessScreen } = useRoleBasedNavigation(currentUser?.role);
  const segments = useSegments();
  const router = useRouter();
  const [refreshCount, setRefreshCount] = useState(0);

  // Auto-refresh every 2 seconds for live debugging
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const healthData = {
    // Clerk Authentication State
    clerk: {
      isLoaded,
      isSignedIn,
      userId: user?.id,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
    },
    // Convex User State
    convex: {
      isLoading,
      hasUser: currentUser !== null,
      hasUserUndefined: currentUser === undefined,
      userId: currentUser?._id,
      role: currentUser?.role,
    },
    // Navigation State
    navigation: {
      segments,
      initialRoute: permissions.defaultRoute,
      currentScreen: segments[segments.length - 1] || 'root',
      canAccessCurrentScreen: segments.length > 0 ? canAccessScreen(segments[segments.length - 1]) : true,
    },
    // System State
    system: {
      timestamp: new Date().toISOString(),
      refreshCount,
    },
  };

  // Console log for debugging
  useEffect(() => {
    console.log('🔍 Navigation Health Check:', healthData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCount]); // Only depend on refreshCount to avoid excessive logging

  const getStatusColor = (condition: boolean | null | undefined) => {
    if (condition === null || condition === undefined) return theme.colors.semantic.warning;
    return condition ? theme.colors.semantic.success : theme.colors.semantic.error;
  };

  const getStatusIcon = (condition: boolean | null | undefined) => {
    if (condition === null || condition === undefined) return 'help-circle';
    return condition ? 'checkmark-circle' : 'close-circle';
  };

  const copyToClipboard = () => {
    const debugInfo = JSON.stringify(healthData, null, 2);
    Alert.alert(
      'Debug Info', 
      `Debug information logged to console.\n\n${debugInfo.substring(0, 200)}...`,
      [
        { text: 'OK', onPress: () => console.log('Full Debug Info:', debugInfo) }
      ]
    );
  };

  const testNavigation = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      Alert.alert('Navigation Error', `Failed to navigate to ${route}: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="bug" size={32} color={theme.colors.primary[500]} />
          <Text style={styles.title}>Navigation Health Check</Text>
          <Text style={styles.subtitle}>Debug & Troubleshooting Tool</Text>
        </View>

        {/* Refresh Indicator */}
        <View style={styles.refreshIndicator}>
          <Ionicons name="refresh" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.refreshText}>Auto-refresh #{refreshCount}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Ionicons name="copy" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.copyText}>Copy Debug Info</Text>
          </TouchableOpacity>
        </View>

        {/* Clerk Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Clerk Authentication</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(healthData.clerk.isLoaded)} 
              size={20} 
              color={getStatusColor(healthData.clerk.isLoaded)} 
            />
            <Text style={styles.statusLabel}>isLoaded:</Text>
            <Text style={styles.statusValue}>{String(healthData.clerk.isLoaded)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(healthData.clerk.isSignedIn)} 
              size={20} 
              color={getStatusColor(healthData.clerk.isSignedIn)} 
            />
            <Text style={styles.statusLabel}>isSignedIn:</Text>
            <Text style={styles.statusValue}>{String(healthData.clerk.isSignedIn)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="person" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>User ID:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>{healthData.clerk.userId || 'null'}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="mail" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>Email:</Text>
            <Text style={styles.statusValue}>{healthData.clerk.userEmail || 'null'}</Text>
          </View>
        </View>

        {/* Convex User Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Convex User Data</Text>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(!healthData.convex.isLoading)} 
              size={20} 
              color={getStatusColor(!healthData.convex.isLoading)} 
            />
            <Text style={styles.statusLabel}>isLoading:</Text>
            <Text style={styles.statusValue}>{String(healthData.convex.isLoading)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(healthData.convex.hasUser)} 
              size={20} 
              color={getStatusColor(healthData.convex.hasUser)} 
            />
            <Text style={styles.statusLabel}>hasUser:</Text>
            <Text style={styles.statusValue}>{String(healthData.convex.hasUser)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="shield" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.statusLabel}>Role:</Text>
            <Text style={[styles.statusValue, styles.roleHighlight]}>
              {healthData.convex.role || 'undefined'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="key" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>User ID:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>{healthData.convex.userId || 'null'}</Text>
          </View>
        </View>

        {/* Navigation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Navigation State</Text>
          <View style={styles.statusRow}>
            <Ionicons name="compass" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.statusLabel}>Initial Route:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>{healthData.navigation.initialRoute}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="location" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>Current Screen:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>{healthData.navigation.currentScreen}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(healthData.navigation.canAccessCurrentScreen)} 
              size={20} 
              color={getStatusColor(healthData.navigation.canAccessCurrentScreen)} 
            />
            <Text style={styles.statusLabel}>Can Access:</Text>
            <Text style={styles.statusValue}>{String(healthData.navigation.canAccessCurrentScreen)}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="list" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>Segments:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>
              [{healthData.navigation.segments.join(', ')}]
            </Text>
          </View>
        </View>

        {/* Quick Navigation Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Navigation Tests</Text>
          <View style={styles.navTestGrid}>
            <TouchableOpacity 
              style={styles.navTestButton} 
              onPress={() => testNavigation('/(tabs)/index')}
            >
              <Text style={styles.navTestText}>Applicant Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navTestButton} 
              onPress={() => testNavigation('/(screens)/(inspector)/inspector-dashboard')}
            >
              <Text style={styles.navTestText}>Inspector Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navTestButton} 
              onPress={() => testNavigation('/(auth)/sign-in')}
            >
              <Text style={styles.navTestText}>Auth Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navTestButton} 
              onPress={() => testNavigation('/(tabs)/profile')}
            >
              <Text style={styles.navTestText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ System Information</Text>
          <View style={styles.statusRow}>
            <Ionicons name="time" size={20} color={theme.colors.text.secondary} />
            <Text style={styles.statusLabel}>Timestamp:</Text>
            <Text style={[styles.statusValue, styles.monospace]}>
              {new Date(healthData.system.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    fontSize: 12,
    color: theme.colors.primary[500],
    marginLeft: 4,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 12,
    marginRight: 8,
    minWidth: 100,
  },
  statusValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  roleHighlight: {
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  navTestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navTestButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  navTestText: {
    fontSize: 12,
    color: theme.colors.primary[700],
    textAlign: 'center',
    fontWeight: '500',
  },
});