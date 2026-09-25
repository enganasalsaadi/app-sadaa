import { Skia, TextAlign, TextDirection } from '@shopify/react-native-skia';
import type { SkParagraph, SkTypefaceFontProvider } from '@shopify/react-native-skia';
import type { TypographyStyle } from '@/core/theme';

interface Params {
  text: string;
  style: TypographyStyle;
  color: string;
  width: number;
  isRTL: boolean;
  fonts: SkTypefaceFontProvider;
}

/** Shapes + lays out text once (HarfBuzz, so Arabic joins correctly); the canvas only blits it. */
export const buildParagraph = ({ text, style, color, width, isRTL, fonts }: Params): SkParagraph => {
  const paragraph = Skia.ParagraphBuilder.Make(
    {
      textDirection: isRTL ? TextDirection.RTL : TextDirection.LTR,
      textAlign: TextAlign.Start,
    },
    fonts,
  )
    .pushStyle({
      color: Skia.Color(color),
      fontFamilies: [style.fontFamily],
      fontSize: style.fontSize,
      heightMultiplier: style.lineHeight / style.fontSize,
      letterSpacing: style.letterSpacing,
    })
    .addText(text)
    .pop()
    .build();
  paragraph.layout(width);
  return paragraph;
};
