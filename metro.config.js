const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// 1. احصل على الإعدادات الافتراضية أولاً
const defaultConfig = getDefaultConfig(__dirname);

// 2. أضف أو عدّل الإعدادات التي تخص SVG
const config = {
  transformer: {
    // حدد محول (transformer) خاص لملفات SVG
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // أخبر Metro أن ملفات .svg ليست "أصولاً" عادية (مثل الصور)
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    // وأخبره أنها ملفات مصدر يمكن معالجتها بواسطة المحول أعلاه
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
