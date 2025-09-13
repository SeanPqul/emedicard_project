const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add SVG support
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Monorepo optimization - only watch what's needed
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const backendGeneratedPath = path.resolve(projectRoot, '../../backend/convex/_generated');

// Only watch mobile app and backend generated files (not entire backend)
config.watchFolders = [
  projectRoot,
  backendGeneratedPath, // Only the _generated folder, not entire backend
];

// Block unnecessary directories to improve performance
config.resolver.blockList = [
  // Block other apps in monorepo
  /.*\/apps\/webadmin\/.*/,

  // Block backend source (keep only _generated)
  /.*\/backend\/convex\/(?!_generated).*/,
  /.*\/backend\/node_modules\/.*/,
  /.*\/backend\/dist\/.*/,

  // Block archived/backup directories
  /.*\/convex_archived\/.*/,
  /.*\/_archived\/.*/,
  /.*\/backup\/.*/,

  // Block build artifacts across monorepo
  /.*\/\.next\/.*/,
  /.*\/\.expo\/.*/,
  /.*\/\.turbo\/.*/,
  /.*\/web-build\/.*/,
  /.*\/dist\/.*/,
  /.*\/build\/.*/,

  // Block unnecessary node_modules (except mobile app's)
  /.*\/packages\/.*\/node_modules\/.*/,

  // Block development artifacts
  /.*\/\.git\/.*/,
  /.*\/\.vscode\/.*/,
  /.*\/\.claude\/.*/,
];

// Optimize resolver for monorepo with pnpm workspaces
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Performance optimizations
config.transformer.minifierPath = 'metro-minify-terser';
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;