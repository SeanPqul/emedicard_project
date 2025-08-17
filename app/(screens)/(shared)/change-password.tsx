import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { styles } from '@/src/styles/screens/tabs-profile';
import { getColor, getSpacing, getTypography } from '@/src/styles/theme';

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
      <Text style={changePasswordStyles.title}>Change Password</Text>
      <TextInput
        style={changePasswordStyles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={changePasswordStyles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={changePasswordStyles.input}
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

