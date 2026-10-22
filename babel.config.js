// Bundle-size only; Jest resolves per-icon paths to untransformed .mjs, so it keeps the barrel.
const lucideIconImports =
  process.env.NODE_ENV === 'test' ? [] : ['./scripts/babel/lucideIconImports'];

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ...lucideIconImports,
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '^@/(.+)': './src/\\1',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
