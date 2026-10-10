import React, { memo, useMemo } from 'react';
import type { TextProps as RNTextProps, TextStyle } from 'react-native';
import { Text as RNText } from 'react-native';
import { useTheme } from '@/core/theme/hooks/useTheme';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/core/config';
import { BASELINE_SHIFT } from '@/core/theme';
import type {
  Mutable,
  TypographyVariant,
  SpacingToken,
} from '@/core/theme/types';
import { applyReplacements } from '@/shared/utils/textReplacer';
import { detectScript } from '@/shared/utils/textScript';

const replaceChild = (child: React.ReactNode): React.ReactNode =>
  typeof child === 'string' ? applyReplacements(child) : child;

/** Plain text of string/number children; `null` when a nested element makes the script unknowable. */
const plainText = (children: React.ReactNode): string | null => {
  const parts = Array.isArray(children) ? children : [children];
  let text = '';
  for (const part of parts) {
    if (typeof part === 'string' || typeof part === 'number') {
      text += String(part);
    } else if (part !== null && part !== undefined && typeof part !== 'boolean') {
      return null;
    }
  }
  return text;
};

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  /** يتجاوز اتجاه الكتابة التلقائي (isRTL) — لمحتوى بلغة ثابتة بصرف النظر عن لغة التطبيق */
  writingDirection?: TextStyle['writingDirection'];
  transform?: TextStyle['textTransform'];
  decoration?: TextStyle['textDecorationLine'];
  italic?: boolean;
  mt?: SpacingToken;
  mb?: SpacingToken;
  ms?: SpacingToken;
  me?: SpacingToken;
  mx?: SpacingToken;
  my?: SpacingToken;
  pt?: SpacingToken;
  pb?: SpacingToken;
  ps?: SpacingToken;
  pe?: SpacingToken;
  px?: SpacingToken;
  py?: SpacingToken;
}

const TextComponent: React.FC<TextProps> = ({
  style,
  children,
  variant = 'body',
  color,
  align,
  writingDirection,
  transform,
  decoration,
  italic,
  mt,
  mb,
  ms,
  me,
  mx,
  my,
  pt,
  pb,
  ps,
  pe,
  px,
  py,
  ...rest
}) => {
  const { typography, colors, spacing, isRTL } = useTheme();

  const text = plainText(children);
  const script = text === null ? null : detectScript(text);

  const computedStyle = useMemo<TextStyle>(() => {
    const variantStyle = typography[variant];

    const s: Mutable<TextStyle> = {
      ...variantStyle,
      color: color ?? colors.text.primary,
    };

    if (align !== undefined) {
      s.textAlign = align;
    }
    if (transform !== undefined) {
      s.textTransform = transform;
    }
    if (decoration !== undefined) {
      s.textDecorationLine = decoration;
    }
    if (italic) {
      s.fontStyle = 'italic';
    }
    // Visual only: the layout box stays put, so rows keep their measured height.
    if (script !== null) {
      s.transform = [
        { translateY: variantStyle.fontSize * BASELINE_SHIFT[script] },
      ];
    }

    if (mt !== undefined) {
      s.marginTop = spacing[mt];
    }
    if (mb !== undefined) {
      s.marginBottom = spacing[mb];
    }
    if (ms !== undefined) {
      s.marginStart = spacing[ms];
    }
    if (me !== undefined) {
      s.marginEnd = spacing[me];
    }
    if (mx !== undefined) {
      s.marginHorizontal = spacing[mx];
    }
    if (my !== undefined) {
      s.marginVertical = spacing[my];
    }

    if (pt !== undefined) {
      s.paddingTop = spacing[pt];
    }
    if (pb !== undefined) {
      s.paddingBottom = spacing[pb];
    }
    if (ps !== undefined) {
      s.paddingStart = spacing[ps];
    }
    if (pe !== undefined) {
      s.paddingEnd = spacing[pe];
    }
    if (px !== undefined) {
      s.paddingHorizontal = spacing[px];
    }
    if (py !== undefined) {
      s.paddingVertical = spacing[py];
    }

    return s;
  }, [
    typography,
    colors.text.primary,
    spacing,
    variant,
    color,
    align,
    transform,
    decoration,
    italic,
    script,
    mt,
    mb,
    ms,
    me,
    mx,
    my,
    pt,
    pb,
    ps,
    pe,
    px,
    py,
  ]);

  const directionStyle = useMemo<TextStyle>(
    () => ({
      writingDirection: writingDirection ?? (isRTL ? 'rtl' : 'ltr'),
    }),
    [writingDirection, isRTL],
  );

  const processedChildren = Array.isArray(children)
    ? children.map(replaceChild)
    : replaceChild(children);

  return (
    <RNText
      maxFontSizeMultiplier={
        rest.maxFontSizeMultiplier ?? MAX_FONT_SIZE_MULTIPLIER
      }
      style={[computedStyle, style, directionStyle]}
      {...rest}
    >
      {processedChildren}
    </RNText>
  );
};

export const Text = memo(TextComponent);
