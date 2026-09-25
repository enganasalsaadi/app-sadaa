import React, { memo, useCallback, useMemo, useState } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { Box, useGlassCardStyle } from '@/shared/ui';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { useCardFonts } from '../hooks/useCardFonts';
import type { SlideCard, SlideData } from '../types';
import { buildParagraph } from '../utils/buildParagraph';
import { CARD_WIDTH_RATIO, measureCardHeight, placeCard } from '../utils/cardLayout';
import type { FloatingCardPlacement } from '../utils/cardLayout';
import { FloatingCard } from './FloatingCard';
import type { CardAppearance } from './FloatingCard';

const BADGE_SIZE = moderateScale(38);

interface CardsCanvasProps {
  slide: SlideData;
  height: number;
}

/**
 * Both cards in a single Skia canvas: one GPU surface, text shaped once per slide.
 * The canvas bleeds past its box so tilted / floating corners aren't clipped.
 */
const CardsCanvasComponent: React.FC<CardsCanvasProps> = ({ slide, height }) => {
  const { colors, spacing, typography, radii, sizes, isRTL } = useTheme();
  const glass = useGlassCardStyle();
  const fonts = useCardFonts();
  const [width, setWidth] = useState(0);
  const bleed = spacing.xl;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const styles = useStyles(
    (): Record<'canvas', ViewStyle> => ({
      canvas: { position: 'absolute', top: -bleed, bottom: -bleed, start: -bleed, end: -bleed },
    }),
    [bleed],
  );

  const appearance = useMemo<CardAppearance>(
    () => ({
      glass,
      isRTL,
      padding: spacing.lg,
      badgeSize: BADGE_SIZE,
      badgeRadius: radii.md,
      badgeFill: colors.glass.badge,
      badgeGap: spacing.md,
      titleGap: spacing.xs,
      iconSize: sizes.icon.md,
      toneColor: { interactive: colors.glass.iconInteractive, money: colors.glass.iconMoney },
    }),
    [glass, isRTL, spacing, radii, colors, sizes],
  );

  const cards = useMemo(() => {
    if (!fonts || width === 0) return null;
    const textWidth = width * CARD_WIDTH_RATIO - appearance.padding * 2;

    const layoutCard = (card: SlideCard, placement: FloatingCardPlacement) => {
      const title = buildParagraph({
        text: card.title,
        style: typography.title,
        color: colors.text.onBrand,
        width: textWidth,
        isRTL,
        fonts,
      });
      const description = buildParagraph({
        text: card.description,
        style: typography.bodyMedium,
        color: colors.text.onBrandMuted,
        width: textWidth,
        isRTL,
        fonts,
      });
      const cardHeight = measureCardHeight({
        padding: appearance.padding,
        badgeSize: appearance.badgeSize,
        badgeGap: appearance.badgeGap,
        titleGap: appearance.titleGap,
        titleHeight: title.getHeight(),
        descriptionHeight: description.getHeight(),
      });
      const frame = placeCard({
        placement,
        canvasWidth: width,
        canvasHeight: height,
        cardHeight,
        inset: spacing.sm,
        isRTL,
      });
      return {
        card,
        title,
        description,
        frame: { ...frame, x: frame.x + bleed, y: frame.y + bleed },
      };
    };

    return { top: layoutCard(slide.cardTop, 'top'), bottom: layoutCard(slide.cardBottom, 'bottom') };
  }, [fonts, width, height, slide, appearance, typography, colors, isRTL, spacing.sm, bleed]);

  const a11yLabel = [slide.cardTop, slide.cardBottom]
    .map(c => `${c.title}. ${c.description}`)
    .join(' ');

  return (
    <Box height={height} onLayout={onLayout} accessible accessibilityLabel={a11yLabel}>
      {cards ? (
        <Canvas style={styles.canvas} pointerEvents="none">
          {/* Keyed per slide so the enter animation replays; bottom first so the top card overlaps it. */}
          <Group key={slide.id}>
            {(['bottom', 'top'] as const).map(placement => {
              const { card, title, description, frame } = cards[placement];
              return (
                <FloatingCard
                  key={placement}
                  placement={placement}
                  frame={frame}
                  appearance={appearance}
                  icon={card.icon}
                  tone={card.tone}
                  title={title}
                  description={description}
                />
              );
            })}
          </Group>
        </Canvas>
      ) : null}
    </Box>
  );
};

export const CardsCanvas = memo(CardsCanvasComponent);
