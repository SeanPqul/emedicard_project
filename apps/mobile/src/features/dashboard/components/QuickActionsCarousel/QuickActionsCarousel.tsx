import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './QuickActionsCarousel.styles';

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

  const ActionCard: React.FC<{ action: QuickActionItem }> = ({ action }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.cardContainer,
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name={action.icon as any} 
              size={moderateScale(28)} 
              color={theme.colors.ui.white}
            />
          </View>
          
          {/* Content - takes up remaining space */}
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{action.title}</Text>
              {action.badge && (
                <View style={[styles.badgeInline, styles[`badge${action.badge.type}`]]}>
                  <Text style={styles.badgeText}>{action.badge.text}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDescription} numberOfLines={2}>{action.description}</Text>
          </View>
          
          {/* Arrow Icon */}
          <View style={styles.arrowIcon}>
            <Ionicons 
              name="chevron-forward" 
              size={moderateScale(20)} 
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
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <Text style={styles.sectionSubtitle}>Guides and information to help you</Text>
      </View>
      
      <View style={styles.cardsStack}>
        {quickActions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </View>
    </View>
  );
};
