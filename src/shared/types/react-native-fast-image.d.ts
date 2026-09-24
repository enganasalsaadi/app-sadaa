// react-native-fast-image@8 imports legacy style types that RN 0.87's Strict
// TypeScript API no longer exports. Restore them so FastImage's ImageStyle
// resolves. Delete once fast-image is replaced. App code: use ViewStyle/ImageStyle.
import type { ImageStyle, ViewStyle } from 'react-native';

declare module 'react-native' {
  interface FlexStyle extends ViewStyle {}
  interface TransformsStyle extends Pick<ViewStyle, 'transform'> {}
  interface ShadowStyleIOS
    extends Pick<
      ImageStyle,
      'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius'
    > {}
}
