import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { styles } from '../../../../assets/styles/tabs-styles/profile';
import { getColor, getSpacing, getTypography } from '../../../../src/styles/theme';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    Alert.alert('Profile Updated', `Name: ${name}, Email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={editProfileStyles.title}>Edit Profile</Text>
      <TextInput
        style={editProfileStyles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={editProfileStyles.input}
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
