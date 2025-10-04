import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getColor, getTypography, getSpacing, getBorderRadius, getShadow } from '@shared/styles/theme';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export type FeedbackPosition = 'top' | 'below-header';

interface FeedbackSystemProps {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
  position?: FeedbackPosition;
}

const { width } = Dimensions.get('window');

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  messages,
  onDismiss,
  position = 'top',
}) => {
  const insets = useSafeAreaInsets();
  
  const getContainerStyle = () => {
    switch (position) {
      case 'below-header':
        return [styles.container, { top: insets.top + 30 }];
      case 'top':
      default:
        return styles.container;
    }
  };
  
  return (
    <View style={getContainerStyle()}>
      {messages.map((message) => (
        <FeedbackItem
          key={message.id}
          message={message}
          onDismiss={() => onDismiss(message.id)}
        />
      ))}
    </View>
  );
};

interface FeedbackItemProps {
  message: FeedbackMessage;
  onDismiss: () => void;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ message, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, message.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (message.type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getColors = () => {
    switch (message.type) {
      case 'success':
        return {
          background: getColor('background.primary'),
          border: getColor('semantic.success'),
          icon: getColor('semantic.success'),
        };
      case 'error':
        return {
          background: getColor('background.primary'),
          border: getColor('semantic.error'),
          icon: getColor('semantic.error'),
        };
      case 'warning':
        return {
          background: getColor('background.primary'),
          border: getColor('semantic.warning'),
          icon: getColor('semantic.warning'),
        };
      case 'info':
        return {
          background: getColor('background.primary'),
          border: getColor('primary.500'),
          icon: getColor('primary.500'),
        };
      default:
        return {
          background: getColor('background.secondary'),
          border: getColor('border.default'),
          icon: getColor('text.secondary'),
        };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.feedbackItem,
        {
          backgroundColor: colors.background,
          borderLeftColor: colors.border,
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={getIconName()} 
          size={24} 
          color={colors.icon} 
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{message.title}</Text>
          {message.message && (
            <Text style={styles.message}>{message.message}</Text>
          )}
        </View>
      </View>
      
      {message.action && (
        <View style={styles.actionContainer}>
          <Text 
            style={[styles.actionText, { color: colors.icon }]}
            onPress={message.action.onPress}
          >
            {message.action.text}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// Hook to manage feedback messages
export const useFeedback = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = useCallback((
    type: FeedbackType,
    title: string,
    message?: string,
    duration?: number,
    action?: { text: string; onPress: () => void }
  ) => {
    const id = Date.now().toString();
    const newMessage: FeedbackMessage = {
      id,
      type,
      title,
      message,
      duration,
      action,
    };

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const dismissFeedback = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearAllFeedback = useCallback(() => {
    setMessages([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) =>
    showFeedback('success', title, message, duration), [showFeedback]);
    
  const showError = useCallback((title: string, message?: string, duration?: number) =>
    showFeedback('error', title, message, duration), [showFeedback]);
    
  const showWarning = useCallback((title: string, message?: string, duration?: number) =>
    showFeedback('warning', title, message, duration), [showFeedback]);
    
  const showInfo = useCallback((title: string, message?: string, duration?: number) =>
    showFeedback('info', title, message, duration), [showFeedback]);

  return {
    messages,
    showFeedback,
    dismissFeedback,
    clearAllFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: getSpacing('md'),
  },
  feedbackItem: {
    borderRadius: getBorderRadius('md'),
    borderLeftWidth: 4,
    marginBottom: getSpacing('sm'),
    ...getShadow('medium'),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: getSpacing('md'),
  },
  icon: {
    marginRight: getSpacing('sm'),
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  message: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    lineHeight: 18,
  },
  actionContainer: {
    paddingHorizontal: getSpacing('md'),
    paddingBottom: getSpacing('md'),
    alignItems: 'flex-end',
  },
  actionText: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
