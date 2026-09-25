import { useFonts } from '@shopify/react-native-skia';

/**
 * Skia can't see native fonts, so the Tajawal weights used on the cards are loaded
 * into a font provider. Aliases are the PostScript names, so `typography.*.fontFamily`
 * maps straight onto them. `null` until loaded.
 */
export const useCardFonts = () =>
  useFonts({
    'Tajawal-Bold': [require('../../../../assets/fonts/Tajawal-Bold.ttf')],
    'Tajawal-Medium': [require('../../../../assets/fonts/Tajawal-Medium.ttf')],
  });
