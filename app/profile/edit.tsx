import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/profile';
import { getTypography, getSpacing, getColor } from '../../src/styles/theme';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    Alert.alert('Profile Updated', `Name: ${name}, Email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Save Changes" onPress={handleSave} color={getColor('accent.medicalBlue')} />
    </View>
  );
}

const editProfileStyles = StyleSheet.create({
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
