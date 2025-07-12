import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Picker } from 'react-native';

const ApplicationScreen = () => {
  const [applicationType, setApplicationType] = useState('New');
  const [jobCategory, setJobCategory] = useState('');
  const [position, setPosition] = useState('');
  const [organization, setOrganization] = useState('');
  const [civilStatus, setCivilStatus] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.stepIndicator}>
        <Text style={styles.stepTitle}>1/4: Basic Info</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Application Type</Text>
        <View style={styles.toggleContainer}>
          <Button title="New" onPress={() => setApplicationType('New')} color={applicationType === 'New' ? '#2E86AB' : '#ccc'} />
          <Button title="Renew" onPress={() => setApplicationType('Renew')} color={applicationType === 'Renew' ? '#2E86AB' : '#ccc'} />
        </View>

        <Text style={styles.label}>Job Category</Text>
        <Picker
          selectedValue={jobCategory}
          onValueChange={(itemValue) => setJobCategory(itemValue)}>
          <Picker.Item label="Select category" value="" />
          <Picker.Item label="Food Handler" value="food" />
          <Picker.Item label="Security Guard" value="security" />
          <Picker.Item label="Others" value="others" />
        </Picker>

        <Text style={styles.label}>Position</Text>
        <TextInput
          style={styles.input}
          value={position}
          onChangeText={setPosition}
          placeholder="Enter your position"
        />

        <Text style={styles.label}>Organization</Text>
        <TextInput
          style={styles.input}
          value={organization}
          onChangeText={setOrganization}
          placeholder="Enter organization name"
        />

        <Text style={styles.label}>Civil Status</Text>
        <Picker
          selectedValue={civilStatus}
          onValueChange={(itemValue) => setCivilStatus(itemValue)}>
          <Picker.Item label="Select status" value="" />
          <Picker.Item label="Single" value="single" />
          <Picker.Item label="Married" value="married" />
          <Picker.Item label="Widowed" value="widowed" />
          <Picker.Item label="Divorced" value="divorced" />
        </Picker>
      </View>

      <Button title="Next" onPress={() => {}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  stepIndicator: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E86AB',
  },
  formSection: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: '#212529',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  }
});

export default ApplicationScreen;
