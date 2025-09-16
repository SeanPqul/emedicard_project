import React from 'react';
import { View, Text, Modal, Animated } from 'react-native';
import { SpinnerVariant } from './SpinnerVariant';
import { DotsVariant } from './DotsVariant';
import { PulseVariant } from './PulseVariant';
import { ProgressIndicator } from './ProgressIndicator';
import { useFadeAnimation } from './hooks';
import { styles } from './styles';
import { getColor } from '../../styles/theme';
import { LoadingSpinnerProps } from './types';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible = true,
  size = 'medium',
  color = getColor('primary.500'),
  message,
  overlay = false,
  type = 'spinner',
  style,
  textStyle,
  fullScreen = false,
  progress,
  icon,
}) => {
  const fadeAnim = useFadeAnimation(visible);

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return <DotsVariant visible={visible} size={size} color={color} />;
      case 'pulse':
        return <PulseVariant visible={visible} size={size} color={color} icon={icon} />;
      case 'spinner':
      default:
        return <SpinnerVariant visible={visible} size={size} color={color} />;
    }
  };

  const content = (
    <Animated.View
      style={[
        overlay ? styles.overlayContainer : styles.container,
        fullScreen && styles.fullScreenContainer,
        { opacity: fadeAnim },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading content'}
      accessibilityLiveRegion="polite"
      accessibilityState={{
        busy: visible,
      }}
    >
      <View style={styles.loadingContent}>
        {renderLoading()}
        {message && (
          <Text 
            style={[styles.message, textStyle]}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            {message}
          </Text>
        )}
        {progress !== undefined && (
          <ProgressIndicator 
            progress={progress} 
            color={color} 
            textStyle={textStyle} 
          />
        )}
      </View>
    </Animated.View>
  );

  if (!visible) return null;

  if (overlay || fullScreen) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        accessibilityViewIsModal={true}
        onRequestClose={() => {}} // Prevent closing during loading
      >
        {content}
      </Modal>
    );
  }

  return content;
};
