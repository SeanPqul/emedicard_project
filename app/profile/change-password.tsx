import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/profile';
import { getTypography, getSpacing, getColor } from '../../src/styles/theme';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    Alert.alert('Password Changed', 'Your password has been updated successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Change Password" onPress={handleChangePassword} color={getColor('accent.medicalBlue')} />
    </View>
  );
}

const changePasswordStyles = StyleSheet.create({
  title: {
    ...getTypography('h4'),
    textAlign: 'center',
    marginVertical: getSpacing('md'),
    color: getColor('text.primary'),
  },
  input: {
    borderColor: getColor('border.light'),
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: getSpacing('sm'),
    padding: getSpacing('sm'),
  },
});

