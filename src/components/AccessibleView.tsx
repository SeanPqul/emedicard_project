import React from 'react';
import { View, ViewProps, AccessibilityRole, AccessibilityState, AccessibilityActionEvent } from 'react-native';

interface AccessibleViewProps extends ViewProps {
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
  actions?: string[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  focusable?: boolean;
  children?: React.ReactNode;
}

export const AccessibleView: React.FC<AccessibleViewProps> = ({
  label,
  hint,
  role,
  state,
  actions,
  onAccessibilityAction,
  focusable = false,
  children,
  ...props
}) => {
  return (
    <View
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={role}
      accessibilityState={state}
      accessibilityActions={actions?.map(action => ({ name: action, label: action }))}
      onAccessibilityAction={onAccessibilityAction}
      accessible={!!label || !!role}
      focusable={focusable}
      {...props}
    >
      {children}
    </View>
  );
};
