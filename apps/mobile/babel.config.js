module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
      }],
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': '.',
          '@/src': './src',
          '@/app': './app',
          '@/assets': './assets',
          '@features': './src/features',
          '@screens': './src/screens',
          '@entities': './src/entities',
          '@processes': './src/processes',
          '@shared': './src/shared',
          '@core': './src/core',
          '@types': './src/types',
          '@backend': '../../backend',
          '@emedicard/constants': '../../packages/constants/src',
          '@emedicard/types': '../../packages/types/src',
          '@emedicard/utils': '../../packages/utils/src',
          '@emedicard/validation': '../../packages/validation/src',
        },
      }],
      // React Native Reanimated plugin should be listed last
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
        ],
      },
    },
  };
};
