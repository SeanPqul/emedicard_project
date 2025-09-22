module.exports = {
  extends: ['expo'],
  settings: {
    'import/resolver': {
      'babel-module': {
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
      },
    },
  },
};