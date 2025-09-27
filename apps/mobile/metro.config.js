const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');  // emedicard_project/

const config = getDefaultConfig(projectRoot);

// SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Watch other workspaces (so imports from backend/packages work)
config.watchFolders = [
  ...config.watchFolders,
  path.resolve(monorepoRoot, 'packages'),
  path.resolve(monorepoRoot, 'backend/convex'),
  monorepoRoot,
];

// Ensure Metro resolves from root node_modules first
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules'),
];

// Deduplicate critical deps (avoid Metro pointing into .pnpm/<hash>)
config.resolver.extraNodeModules = {
  react: path.resolve(monorepoRoot, 'node_modules/react'),
  'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
  'expo-router': path.resolve(monorepoRoot, 'node_modules/expo-router'),
  'react-dom': path.resolve(monorepoRoot, 'node_modules/react-dom'),
  '@babel/runtime': path.resolve(monorepoRoot, 'node_modules/@babel/runtime'),
};

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
