import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import ElevatedTabButton from '../components/ElevatedTabButton';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ICONS = {
  dashboard: {
    focused: 'home' as const,
    unfocused: 'home-outline' as const,
  },
  sessions: {
    focused: 'calendar' as const,
    unfocused: 'calendar-outline' as const,
  },
  scanner: {
    focused: 'qr-code' as const,
    unfocused: 'qr-code' as const,
  },
  history: {
    focused: 'document-text' as const,
    unfocused: 'document-text-outline' as const,
  },
  settings: {
    focused: 'settings' as const,
    unfocused: 'settings-outline' as const,
  },
};

function InspectorTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom || moderateScale(8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const routeName = route.name as keyof typeof ICONS;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            router.push(`/(inspector-tabs)/${route.name}` as any);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        if (routeName === 'scanner') {
          return (
            <View key={route.key} style={styles.centerButtonContainer}>
              <ElevatedTabButton
                onPress={onPress}
                focused={isFocused}
                testID={`tab-${route.name}`}
                iconName="qr-code"
                gradientColors={['#2E86AB', '#1D4ED8']}
                iconColor="#FFFFFF"
              />
            </View>
          );
        }

        const iconName = isFocused ? ICONS[routeName].focused : ICONS[routeName].unfocused;
        const color = isFocused ? '#10B981' : '#9CA3AF';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel}
            testID={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={moderateScale(24)} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function InspectorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
      tabBar={(props) => <InspectorTabBar {...props} />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    borderTopWidth: 0,
    paddingHorizontal: moderateScale(8),
    paddingTop: moderateScale(12),
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    paddingBottom: moderateScale(20),
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
