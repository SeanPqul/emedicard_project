import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { SecondaryAction } from './hooks/useDashboardMenu';

interface ActionsMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: SecondaryAction[];
  onActionPress: (action: SecondaryAction) => void;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({
  visible,
  onClose,
  actions,
  onActionPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Quick Actions</Text>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            >
              {actions.map((action) => (
                <MenuItem
                  key={action.id}
                  action={action}
                  onPress={onActionPress}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

interface MenuItemProps {
  action: SecondaryAction;
  onPress: (action: SecondaryAction) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ action, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => onPress(action)}
      accessibilityRole="button"
      accessibilityLabel={action.accessibilityLabel}
      accessibilityHint={action.accessibilityHint}
    >
      <Ionicons
        name={action.icon as any}
        size={24}
        color={theme.colors.text.primary}
        style={styles.menuItemIcon}
      />
      <Text style={styles.menuItemText}>{action.label}</Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.text.tertiary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    marginRight: theme.spacing.md,
  },
  menuContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    minWidth: 240,
    maxWidth: 280,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.large,
  },
  menuTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.xs,
  },
  scrollView: {
    maxHeight: 300, // Prevent menu from becoming too tall
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  menuItemIcon: {
    marginRight: theme.spacing.sm,
  },
  menuItemText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
  },
});
