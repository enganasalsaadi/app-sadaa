export type FloatingCardPlacement = 'top' | 'bottom';

export interface CardFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CARD_WIDTH_RATIO = 0.85;

interface CardMetrics {
  padding: number;
  badgeSize: number;
  badgeGap: number;
  titleGap: number;
  titleHeight: number;
  descriptionHeight: number;
}

export const measureCardHeight = (m: CardMetrics): number =>
  m.padding * 2 + m.badgeSize + m.badgeGap + m.titleHeight + m.titleGap + m.descriptionHeight;

interface PlaceParams {
  placement: FloatingCardPlacement;
  canvasWidth: number;
  canvasHeight: number;
  cardHeight: number;
  inset: number;
  isRTL: boolean;
}

/**
 * Skia has no logical start/end, so RTL is resolved here: the top card sits on
 * the reading-start side, the bottom card on the end side.
 */
export const placeCard = ({
  placement,
  canvasWidth,
  canvasHeight,
  cardHeight,
  inset,
  isRTL,
}: PlaceParams): CardFrame => {
  const width = canvasWidth * CARD_WIDTH_RATIO;
  const startX = isRTL ? canvasWidth - width : 0;
  const endX = isRTL ? 0 : canvasWidth - width;

  return placement === 'top'
    ? { x: startX, y: inset, width, height: cardHeight }
    : { x: endX, y: canvasHeight - inset - cardHeight, width, height: cardHeight };
};
