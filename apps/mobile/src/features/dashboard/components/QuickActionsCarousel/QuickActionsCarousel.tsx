import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale, scale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './QuickActionsCarousel.styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75; // 75% of screen width
const CARD_SPACING = scale(16);

interface QuickActionItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
  gradient: [string, string];
  badge?: {
    text: string;
    type: 'info' | 'warning' | 'error' | 'success';
  };
}

interface QuickActionsCarouselProps {
  userApplications?: any[];
  dashboardStats?: any;
  currentApplication?: any;
}

export const QuickActionsCarousel: React.FC<QuickActionsCarouselProps> = ({
  userApplications,
  dashboardStats,
  currentApplication,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Generate contextual quick actions based on user state
  const getQuickActions = (): QuickActionItem[] => {
    const actions: QuickActionItem[] = [];
    
    const isNewUser = (!userApplications || userApplications.length === 0) && dashboardStats?.validHealthCards === 0;
    const hasActiveCard = dashboardStats?.validHealthCards > 0;
    const isFoodHandler = ((currentApplication?.jobCategory?.name ?? '').toLowerCase()).includes('food');
    
    // Primary action based on user state (payments handled by ActionCenter now)
    if (isNewUser) {
      actions.push({
        id: 'start-application',
        icon: 'add-circle',
        title: 'Start Your Journey',
        description: 'Apply for your first health card and join thousands of healthy workers',
        route: '/(tabs)/apply',
        gradient: [theme.colors.primary[500], theme.colors.primary[600]],
      });
    } else if (hasActiveCard) {
      actions.push({
        id: 'view-card',
        icon: 'qr-code',
        title: 'View Health Card',
        description: 'Show your digital health card QR code',
        route: '/(screens)/(shared)/qr-code',
        gradient: [theme.colors.semantic.success, theme.colors.green[600]],
      });
    }
    
    // Helpful actions
    
    if (isFoodHandler) {
      actions.push({
        id: 'food-safety',
        icon: 'restaurant',
        title: 'Food Safety Training',
        description: 'Complete required food handler orientation',
        route: '/(screens)/(shared)/orientation/food-safety-info',
        gradient: [theme.colors.orange[500], theme.colors.orange[600]],
        badge: { text: 'Required', type: 'warning' },
      });
    }
    
    actions.push({
      id: 'requirements',
      icon: 'list',
      title: 'View Requirements',
      description: 'See what documents you need for your application',
      route: '/(screens)/(shared)/documents/requirements',
      gradient: [theme.colors.gray[600], theme.colors.gray[700]],
    });
    
    actions.push({
      id: 'help-center',
      icon: 'help-circle',
      title: 'Help Center',
      description: 'Get answers to frequently asked questions',
      route: '/(screens)/(shared)/help-center',
      gradient: [theme.colors.indigo[500], theme.colors.indigo[600]],
    });
    
    return actions;
  };

  const quickActions = getQuickActions();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const ActionCard: React.FC<{ action: QuickActionItem; index: number }> = ({ action, index }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardContainer,
          { width: CARD_WIDTH },
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => router.push(action.route as any)}
      >
        <LinearGradient
          colors={action.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Badge */}
          {action.badge && (
            <View style={[styles.badge, styles[`badge${action.badge.type}`]]}>
              <Text style={styles.badgeText}>{action.badge.text}</Text>
            </View>
          )}
          
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={action.icon as any} 
              size={moderateScale(36)} 
              color={theme.colors.ui.white}
            />
          </View>
          
          {/* Content */}
          <Text style={styles.cardTitle}>{action.title}</Text>
          <Text style={styles.cardDescription}>{action.description}</Text>
          
          {/* Action Button */}
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Get Started</Text>
            <Ionicons 
              name="arrow-forward" 
              size={moderateScale(18)} 
              color={theme.colors.ui.white}
            />
          </View>
          
          {/* Decorative Elements */}
          <View style={styles.decorativeShape1} />
          <View style={styles.decorativeShape2} />
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>Swipe to explore more</Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {quickActions.map((action, index) => (
          <ActionCard key={action.id} action={action} index={index} />
        ))}
      </ScrollView>
      
      {/* Page Indicator */}
      <View style={styles.pageIndicatorContainer}>
        {quickActions.slice(0, 5).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              index === activeIndex && styles.pageIndicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};
