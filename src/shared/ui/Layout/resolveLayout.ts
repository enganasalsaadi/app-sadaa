import type { Edge } from 'react-native-safe-area-context';
import type { SpacingToken } from '@/core/theme/types';
import type { ScreenHeaderVariant } from '../ScreenHeader';
import { HEADER_STATUS_BAR } from '../ScreenHeader/headerColors';
import type {
  LayoutHeaderBehavior,
  LayoutKeyboard,
  LayoutMode,
  LayoutPadding,
  LayoutStatusBar,
  LayoutSurface,
} from './types';

export const LAYOUT_DEFAULT_PADDING = { x: 'xl', y: 'lg' } as const satisfies Required<LayoutPadding>;

interface ResolveLayoutInput {
  mode: LayoutMode;
  hasHeader: boolean;
  /** Config header (`ScreenHeader`), as opposed to a custom element. */
  headerIsConfig: boolean;
  headerVariant: ScreenHeaderVariant | undefined;
  headerBehavior: LayoutHeaderBehavior | undefined;
  hasHero: boolean;
  hasSticky: boolean;
  hasFooter: boolean;
  inHeroSheet: boolean;
  padding: LayoutPadding | 'none' | undefined;
  keyboard: LayoutKeyboard | undefined;
  surface: LayoutSurface | undefined;
  statusBar: LayoutStatusBar;
}

export interface ResolvedLayout {
  edges: Edge[];
  paddingX: SpacingToken | undefined;
  paddingY: SpacingToken | undefined;
  keyboard: LayoutKeyboard;
  surface: LayoutSurface;
  headerBehavior: LayoutHeaderBehavior;
  /** Overlay headers start transparent over the hero. */
  headerVariant: ScreenHeaderVariant;
  /** Header is absolutely positioned over the body (`hideOnScroll`, `overlay`). */
  headerFloats: boolean;
  hero: boolean;
  sticky: boolean;
  statusBar: LayoutStatusBar;
}

/**
 * Pure chrome decisions, kept out of the component so they're unit-tested.
 * Top inset: owned by the header or the hero sheet when present.
 * Bottom inset: owned by the footer when present; in scroll mode the content
 * padding clears it instead, so content can scroll behind the home indicator.
 */
export const resolveLayout = ({
  mode,
  hasHeader,
  headerIsConfig,
  headerVariant,
  headerBehavior,
  hasHero,
  hasSticky,
  hasFooter,
  inHeroSheet,
  padding,
  keyboard,
  surface,
  statusBar,
}: ResolveLayoutInput): ResolvedLayout => {
  const scrolls = mode === 'scroll';
  const hero = scrolls && hasHero;
  const behavior: LayoutHeaderBehavior =
    scrolls && headerIsConfig ? headerBehavior ?? (hero ? 'overlay' : 'fixed') : 'fixed';
  const variant = headerVariant ?? (behavior === 'overlay' ? 'transparent' : 'solid');
  const headerFloats = hasHeader && (behavior === 'hideOnScroll' || behavior === 'overlay');

  const edges: Edge[] = ['left', 'right'];
  // A hero runs under the status bar like a header does.
  if (!hasHeader && !inHeroSheet && !hero) edges.push('top');
  if (mode === 'static' && !hasFooter) edges.push('bottom');

  const pad = padding === 'none' ? undefined : { ...LAYOUT_DEFAULT_PADDING, ...padding };

  return {
    edges,
    paddingX: pad?.x,
    paddingY: pad?.y,
    keyboard: keyboard ?? (mode === 'scroll' ? 'avoid' : 'none'),
    surface: surface ?? (inHeroSheet ? 'surface' : 'base'),
    headerBehavior: behavior,
    headerVariant: variant,
    headerFloats,
    hero,
    // Sticks to the scroll view's top edge, which a floating header covers.
    sticky: scrolls && hasSticky && !headerFloats,
    statusBar:
      statusBar !== 'auto'
        ? statusBar
        : hasHeader
          ? HEADER_STATUS_BAR[variant]
          : hero
            ? 'light'
            : 'auto',
  };
};
