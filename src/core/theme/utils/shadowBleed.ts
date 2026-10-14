import type { ShadowStyle } from '../tokens/shadows';

export interface ShadowBleed {
  top: number;
  bottom: number;
  side: number;
}

/**
 * How far a shadow paints past its view's edges: the blur reaches `shadowRadius` all
 * round, shifted by the offset. A clipping parent (any ScrollView) needs this much
 * inner room or the shadow is cut flat.
 */
export const shadowBleed = ({ shadowOffset, shadowRadius = 0 }: ShadowStyle): ShadowBleed => {
  const dx = Math.abs(shadowOffset?.width ?? 0);
  const dy = shadowOffset?.height ?? 0;
  return {
    top: Math.max(0, shadowRadius - dy),
    bottom: Math.max(0, shadowRadius + dy),
    side: shadowRadius + dx,
  };
};
