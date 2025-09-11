import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { styles } from '@/src/styles/screens/tabs-profile';
import { profileEditStyles } from '@/src/styles/screens/shared-profile-edit';
import { getColor } from '@/src/styles/theme';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    Alert.alert('Profile Updated', `Name: ${name}, Email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={profileEditStyles.title}>Edit Profile</Text>
      <TextInput
        style={profileEditStyles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={profileEditStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Save Changes" onPress={handleSave} color={getColor('accent.medicalBlue')} />
    </View>
  );
}

