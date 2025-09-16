import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerificationSuccessProps {
  successTitle: string;
  successSubtitle: string;
  countdown: number;
  showContinueButton: boolean;
  autoRedirect: boolean;
  scaleAnim: Animated.Value;
  onContinue: () => void;
  styles: {
    successContainer: any;
    successContent: any;
    successIcon: any;
    successTitle: any;
    successSubtitle: any;
    countdownContainer: any;
    countdownText: any;
    continueButton: any;
    continueButtonText: any;
  };
}

export const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  successTitle,
  successSubtitle,
  countdown,
  showContinueButton,
  autoRedirect,
  scaleAnim,
  onContinue,
  styles,
}) => {
  return (
    <View style={styles.successContainer}>
      <Animated.View
        style={[styles.successContent, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.successIcon}>
          <Ionicons 
            name="checkmark-circle" 
            size={80} 
            color="#10B981" 
            accessibilityLabel="Success checkmark"
          />
        </View>
        
        <Text style={styles.successTitle}>{successTitle}</Text>
        <Text style={styles.successSubtitle}>{successSubtitle}</Text>
        
        {autoRedirect && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}
            </Text>
            {showContinueButton && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onContinue}
                accessibilityRole="button"
                accessibilityLabel="Continue now"
              >
                <Text style={styles.continueButtonText}>Continue Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {!autoRedirect && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};
