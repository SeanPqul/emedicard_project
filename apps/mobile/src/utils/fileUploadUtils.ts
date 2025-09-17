import { Alert, Platform, PermissionsAndroid } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Requests camera permissions for image capturing.
 * Returns true if permission is granted, otherwise false.
 */
export async function requestCameraPermissions() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message:
          'App needs access to your camera ' +
          'to take pictures of your documents.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }
}

/**
 * Launches image picker for taking photos using the camera.
 * Returns the captured image if successful, otherwise null.
 */
export async function pickImageFromCamera() {
  const hasPermission = await requestCameraPermissions();

  if (!hasPermission) {
    Alert.alert('Permission required', 'Camera permission is required to take photos');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  return !result.canceled ? result.assets[0] : null;
}

/**
 * Launches gallery picker for image selection.
 * Returns the selected image if successful, otherwise null.
 */
export async function pickImageFromGallery() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('Permission required', 'Gallery permission is required to select photos');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  return !result.canceled ? result.assets[0] : null;
}

/**
 * Launches document picker for file selection.
 * Returns the selected document if successful, otherwise null.
 */
export async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/*'],
    copyToCacheDirectory: true,
  });

  return !result.canceled ? result.assets[0] : null;
}
