module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // react-native-worklets/plugin powers Reanimated v4 + pressto/pulsar worklets.
    // Must stay LAST in the plugins list.
    plugins: ['react-native-worklets/plugin'],
  };
};
