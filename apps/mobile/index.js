// Apply patches and error suppression before loading Expo Router
import './patches/expo-router-init';
import './src/app-layer/init/appInit';

// Now load Expo Router
import 'expo-router/entry';
