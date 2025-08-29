import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { styles as tabsProfileStyles } from '@/src/styles/screens/tabs-profile';
import { getColor } from '@/src/styles/theme';
import { styles } from '@/src/styles/screens/shared-change-password';

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
    <View style={tabsProfileStyles.container}>
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
