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
    // ✅ JSX 및 TSX 파일을 인식하도록 확장자 설정 추가
    defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'jsx', 'tsx'];
  return mergeConfig(defaultConfig, {});
})();
