const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  if (!defaultConfig.resolver.assetExts.includes('png')) {
    defaultConfig.resolver.assetExts.push('png');
  }
  return mergeConfig(defaultConfig, {});
})();
