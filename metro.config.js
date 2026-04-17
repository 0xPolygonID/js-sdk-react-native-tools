const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Enable package.json `exports` field resolution.
    // The @iden3/* and @0xpolygonid/js-sdk packages only publish exports (no `main` field).
    // We put 'browser' first so Metro picks the browser build instead of the Node.js build.
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['browser', 'react-native', 'require', 'default'],
    extraNodeModules: {
      crypto: require.resolve('react-native-crypto'),
      // buffer: require.resolve('buffer/'),
      fs: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser.js'),
      constants: require.resolve('constants-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('readable-stream'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
