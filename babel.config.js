module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          '@0xpolygonid/js-sdk': '@0xpolygonid/js-sdk/dist/node/esm',
          '@iden3/js-crypto': '@iden3/js-crypto/dist/node/esm',
          '@iden3/js-jwz': '@iden3/js-jwz/dist/node/esm',
          '@iden3/js-merkletree': '@iden3/js-merkletree/dist/node/esm',
          '@iden3/js-jsonld-merklization': '@iden3/js-jsonld-merklization/dist/node/esm',
          'snarkjs': 'snarkjs/build/snarkjs.js',
        },
      },
    ],
    ["@babel/plugin-transform-private-methods", { "loose": true }]
  ],
};
