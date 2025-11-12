import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/shared/styles/theme';
import { useNetworkStatus } from '@/src/shared/hooks/useNetworkStatus';

interface AnimatedSplashScreenProps {
  onAnimationComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ 
  onAnimationComplete 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  
  const { isConnected, isOffline, refresh } = useNetworkStatus();

  useEffect(() => {
    // Main fade and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto complete after animation if online
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, pulseAnim]);

  // Check network status after animation completes
  useEffect(() => {
    if (animationComplete) {
      if (isConnected && !isOffline) {
        // Online - proceed to app
        onAnimationComplete?.();
      } else {
        // Offline - show message
        setShowOfflineMessage(true);
      }
    }
  }, [animationComplete, isConnected, isOffline, onAnimationComplete]);

  const handleRetry = async () => {
    setShowOfflineMessage(false);
    await refresh();
    
    // Check again after refresh
    setTimeout(() => {
      if (isConnected && !isOffline) {
        onAnimationComplete?.();
      } else {
        setShowOfflineMessage(true);
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated pulse circle */}
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>E</Text>
          </View>
        </Animated.View>

        {/* App name */}
        <Text style={styles.appName}>Emedicard</Text>
        <Text style={styles.tagline}>Health Card Services</Text>
      </Animated.View>

      {/* Offline Message */}
      {showOfflineMessage && (
        <Animated.View style={[styles.offlineContainer, { opacity: fadeAnim }]}>
          <View style={styles.offlineCard}>
            <Ionicons name="cloud-offline" size={48} color={colors.status.error} />
            <Text style={styles.offlineTitle}>No Internet Connection</Text>
            <Text style={styles.offlineMessage}>
              Please check your connection and try again
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color={colors.ui.white} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Loading indicator when checking network */}
      {animationComplete && !showOfflineMessage && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}

      {/* Bottom accent */}
      <Animated.View 
        style={[
          styles.bottomAccent,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.accentBar} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.brand.primary + '15', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.ui.white,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  accentBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brand.primary,
  },
  offlineContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  offlineCard: {
    backgroundColor: colors.ui.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.ui.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  offlineMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: colors.ui.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
