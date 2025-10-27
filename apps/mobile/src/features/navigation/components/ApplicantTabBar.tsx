import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import ElevatedTabButton from './ElevatedTabButton';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ICONS = {
  index: {
    focused: 'home' as const,
    unfocused: 'home-outline' as const,
  },
  application: {
    focused: 'document-text' as const,
    unfocused: 'document-text-outline' as const,
  },
  apply: {
    focused: 'add-circle' as const,
    unfocused: 'add-circle' as const,
  },
  notification: {
    focused: 'notifications' as const,
    unfocused: 'notifications-outline' as const,
  },
  profile: {
    focused: 'person' as const,
    unfocused: 'person-outline' as const,
  },
};

export default function ApplicantTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

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
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Elevated center button for "apply" tab
        if (routeName === 'apply') {
          return (
            <View key={route.key} style={styles.centerButtonContainer}>
              <ElevatedTabButton
                onPress={onPress}
                focused={isFocused}
                testID={`tab-${route.name}`}
                iconName="add-circle"
                gradientColors={['#10B981', '#059669']}
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
            testID={`tab-${route.name}`}
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
