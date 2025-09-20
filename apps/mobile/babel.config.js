module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
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
