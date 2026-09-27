import type React from 'react';
import type { ScrollViewProps } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import type { SpacingToken } from '@/core/theme/types';
import type { ScreenHeaderProps } from '../ScreenHeader';

/** `scroll`: Layout owns a keyboard-aware ScrollView. `static`: fixed body; lists/WebViews/gestures scroll themselves. */
export type LayoutMode = 'scroll' | 'static';
/** Screen background, resolved to the theme token for the active mode. */
export type LayoutSurface = 'base' | 'surface' | 'transparent';
/** `avoid`: inputs and the footer stay above the keyboard. */
export type LayoutKeyboard = 'avoid' | 'none';
export type LayoutBackdrop = 'none' | 'wash';
export type LayoutStatusBar = 'auto' | 'light' | 'dark';
/**
 * How a config `header` reacts to scrolling. Scroll mode only; `static` and element
 * headers are always `fixed`.
 * - `fixed`: pinned; a divider fades in once content scrolls under it.
 * - `hideOnScroll`: slides away scrolling down, comes back scrolling up (feeds, long reads).
 * - `collapse`: large title at the top of the content that shrinks into the bar.
 * - `overlay`: floats over `hero`; its background and title fade in as the hero scrolls away.
 * Default: `overlay` when `hero` is set, else `fixed`.
 */
export type LayoutHeaderBehavior = 'fixed' | 'hideOnScroll' | 'collapse' | 'overlay';
/**
 * - `divider` (default): hairline while content continues under the footer.
 * - `elevate`: blends with the screen at rest, lifts onto a raised surface while content is under it.
 */
export type LayoutFooterBehavior = 'divider' | 'elevate';

export interface LayoutPadding {
  x?: SpacingToken;
  y?: SpacingToken;
}

/** `ScreenHeader` rendered by Layout; it always paints behind the status bar. */
export type LayoutHeaderConfig = Omit<ScreenHeaderProps, 'withSafeArea' | 'motion' | 'onLayout'>;

export interface LayoutProps {
  children: React.ReactNode;
  /** Default `scroll`. */
  mode?: LayoutMode;
  /** Default `base` (`surface` inside `HeroSheet`). */
  surface?: LayoutSurface;
  /** Content padding. Default `{ x: 'xl', y: 'lg' }`; `'none'` for edge-to-edge content. */
  padding?: LayoutPadding | 'none';
  /**
   * Fixed header above the body. A config renders `ScreenHeader`; an element is
   * rendered as-is and must handle the top safe area itself.
   */
  header?: LayoutHeaderConfig | React.ReactElement;
  headerBehavior?: LayoutHeaderBehavior;
  /** Scroll mode only. Edge-to-edge content above the body (cover image, profile banner); runs under the status bar. */
  hero?: React.ReactNode;
  /** Scroll mode only. Sticks under the header once scrolled to (tabs, segmented filter). Not sticky under a floating header. */
  sticky?: React.ReactNode;
  /** Pinned below the body, above the keyboard; usually `<LayoutFooter />`. Bottom inset handled by Layout. */
  footer?: React.ReactNode;
  footerBehavior?: LayoutFooterBehavior;
  /** Floats above the body, clear of the footer and home indicator; usually a `FAB`. */
  overlay?: React.ReactNode;
  /** Default: `scroll` → `avoid`, `static` → `none`. */
  keyboard?: LayoutKeyboard;
  /** Default `auto` (follows theme). Ignored inside `HeroSheet`, which owns the status bar. */
  statusBar?: LayoutStatusBar;
  backdrop?: LayoutBackdrop;
  /** Escape hatch. Default is derived from header / footer / mode / HeroSheet. */
  edges?: Edge[];
  /** `scroll` mode only. */
  scrollProps?: LayoutScrollProps;
}

export type LayoutScrollProps = Pick<ScrollViewProps, 'refreshControl'>;
