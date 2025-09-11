const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Allow imports from backend directory
const projectRoot = __dirname;
const backendRoot = path.resolve(projectRoot, '../../backend');

config.watchFolders = [projectRoot, backendRoot];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;