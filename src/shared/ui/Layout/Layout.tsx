import React, { isValidElement, memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import LinearGradient from 'react-native-linear-gradient';
import { useStyles, useTheme, type Theme } from '@/core/theme';
import { layoutStatusBarToSystemBarStyle } from '@/shared/utils';
import { Box } from '../primitives/Box';
import { useInHeroSheet } from '../HeroSheet/HeroSheetContext';
import { LayoutContext } from './LayoutContext';
import { LayoutFooterSlot } from './LayoutFooterSlot';
import { LayoutHeaderSlot } from './LayoutHeaderSlot';
import { LayoutHero } from './LayoutHero';
import { LayoutHeroBackdrop } from './LayoutHeroBackdrop';
import { LayoutLargeTitle } from './LayoutLargeTitle';
import { LayoutScrollBody } from './LayoutScrollBody';
import { useHeaderMotion } from './hooks/useHeaderMotion';
import { useLayoutScroll } from './hooks/useLayoutScroll';
import { LAYOUT_DEFAULT_PADDING, resolveLayout } from './resolveLayout';
import type { LayoutHeaderConfig, LayoutProps, LayoutSurface } from './types';

/** `heroBehavior="parallax"`: the hero moves at 60% of the scroll speed. */
const HERO_PARALLAX = 0.4;

const surfaceColor = (colors: Theme['colors'], surface: LayoutSurface): string => {
  switch (surface) {
    case 'base':
      return colors.layout.base;
    case 'surface':
      return colors.surface.main;
    case 'transparent':
      return colors.layout.transparent;
    default: {
      const _exhaustive: never = surface;
      return _exhaustive;
    }
  }
};

/**
 * Screen chrome: safe area, status bar, header (and its scroll behaviour), optional
 * hero / sticky row, body (keyboard-aware scroll or static), overlay (FAB) and a
 * footer pinned above the keyboard. Chrome decisions live in `resolveLayout`;
 * scroll-driven header values in `useHeaderMotion`; this file only composes.
 */
const LayoutComponent: React.FC<LayoutProps> = ({
  children,
  mode = 'scroll',
  surface,
  padding,
  header,
  headerBehavior,
  hero,
  heroBackdrop = 'none',
  heroBehavior = 'static',
  sticky,
  footer,
  footerBehavior = 'divider',
  overlay,
  keyboard,
  statusBar = 'auto',
  backdrop = 'none',
  edges,
  scrollProps,
}) => {
  const { colors, spacing, isDark } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const inHeroSheet = useInHeroSheet();
  const reduceMotion = useReducedMotion();
  const scroll = useLayoutScroll();
  const [footerHeight, setFooterHeight] = useState(0);
  const [floatingHeaderHeight, setFloatingHeaderHeight] = useState(0);
  const [backdropHeight, setBackdropHeight] = useState(0);
  const headerHeight = useSharedValue(0);
  const heroHeight = useSharedValue(0);
  const largeTitleHeight = useSharedValue(0);

  const headerConfig: LayoutHeaderConfig | null =
    header != null && !isValidElement(header) ? header : null;
  const hasFooter = footer != null;
  const scrolls = mode === 'scroll';

  const resolved = resolveLayout({
    mode,
    hasHeader: header != null,
    headerIsConfig: headerConfig != null,
    headerVariant: headerConfig?.variant,
    headerBehavior,
    hasHero: hero != null,
    hasSticky: sticky != null,
    hasFooter,
    inHeroSheet,
    padding,
    keyboard,
    surface,
    statusBar,
  });
  const bg = surfaceColor(colors, resolved.surface);
  const { paddingX, paddingY, headerBehavior: behavior, headerVariant, headerFloats } = resolved;
  const parallax = resolved.hero && heroBehavior === 'parallax' && !reduceMotion ? HERO_PARALLAX : 0;
  const brandBackdrop = resolved.hero && heroBackdrop !== 'none';

  const headerMotion = useHeaderMotion({
    behavior,
    scrollY: scroll.scrollY,
    headerHeight,
    topInset: top,
    heroHeight,
    largeTitleHeight,
  });

  const contextValue = useMemo(
    () => ({ paddingX: paddingX ?? LAYOUT_DEFAULT_PADDING.x }),
    [paddingX],
  );
  const safeAreaStyle = useMemo(() => [styles.flex, { backgroundColor: bg }], [bg]);

  // Scroll mode without a footer: the body runs under the home indicator, so lift the overlay off it.
  const overlayBottom = scrolls && !hasFooter ? bottom : 0;
  const overlayStyle = useStyles(
    (): Record<'overlay', ViewStyle> => ({
      overlay: { position: 'absolute', top: 0, start: 0, end: 0, bottom: overlayBottom },
    }),
    [overlayBottom],
  ).overlay;

  const onFooterLayout = useCallback((event: LayoutChangeEvent) => {
    setFooterHeight(event.nativeEvent.layout.height);
  }, []);
  const onHeaderLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      headerHeight.value = height;
      setFloatingHeaderHeight(height);
    },
    [headerHeight],
  );
  const onHeroLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      heroHeight.value = height;
      setBackdropHeight(height);
    },
    [heroHeight],
  );
  const onLargeTitleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      largeTitleHeight.value = event.nativeEvent.layout.height;
    },
    [largeTitleHeight],
  );

  const headerNode = headerConfig ? (
    <LayoutHeaderSlot
      config={headerConfig}
      variant={headerVariant}
      behavior={behavior}
      floats={headerFloats}
      motion={headerMotion.motion}
      translateY={headerMotion.translateY}
      onLayout={onHeaderLayout}
    />
  ) : isValidElement(header) ? (
    header
  ) : null;

  const leading = resolved.hero ? (
    <LayoutHero scrollY={scroll.scrollY} parallax={parallax} onLayout={onHeroLayout}>
      {hero}
    </LayoutHero>
  ) : behavior === 'collapse' && headerConfig ? (
    <LayoutLargeTitle
      title={headerConfig.title}
      subtitle={headerConfig.subtitle}
      paddingX={paddingX}
      paddingY={paddingY}
      onLayout={onLargeTitleLayout}
    />
  ) : null;

  const avoidKeyboard = resolved.keyboard === 'avoid';

  const body = scrolls ? (
    <LayoutScrollBody
      keyboardAware={avoidKeyboard}
      paddingX={paddingX}
      paddingY={paddingY}
      clearBottomInset={!hasFooter}
      keyboardBottomOffset={footerHeight + spacing.lg}
      scroll={scroll}
      refreshControl={scrollProps?.refreshControl}
      leading={leading}
      sticky={resolved.sticky ? sticky : undefined}
      bg={bg}
      // Overlay headers float over the hero on purpose; a hiding one needs room at rest.
      topOffset={behavior === 'hideOnScroll' && headerFloats ? floatingHeaderHeight : 0}
      sheet={brandBackdrop}
    >
      {!resolved.sticky && sticky != null ? sticky : null}
      {children}
    </LayoutScrollBody>
  ) : (
    <Box flex={1} px={paddingX} py={paddingY}>
      {children}
    </Box>
  );

  const bodyWithOverlay =
    overlay != null ? (
      <Box flex={1}>
        {body}
        <Box style={overlayStyle} pointerEvents="box-none">
          {overlay}
        </Box>
      </Box>
    ) : (
      body
    );

  const footerNode = hasFooter ? (
    <LayoutFooterSlot
      bg={bg}
      behavior={footerBehavior}
      sticky={scrolls && avoidKeyboard}
      scrollY={scrolls ? scroll.scrollY : undefined}
      contentHeight={scrolls ? scroll.contentHeight : undefined}
      viewportHeight={scrolls ? scroll.viewportHeight : undefined}
      onLayout={onFooterLayout}
    >
      {footer}
    </LayoutFooterSlot>
  ) : null;

  // Static bodies have no scroll view to absorb the keyboard: shrink body + footer together.
  const content =
    mode === 'static' && avoidKeyboard ? (
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        {bodyWithOverlay}
        {footerNode}
      </KeyboardAvoidingView>
    ) : (
      <>
        {bodyWithOverlay}
        {footerNode}
      </>
    );

  // Overlay header: light icons over the hero, back to the theme once the bar turns solid.
  const statusBarStyle =
    statusBar === 'auto' && behavior === 'overlay' && headerMotion.overlaySolid
      ? 'auto'
      : resolved.statusBar;

  return (
    <LayoutContext.Provider value={contextValue}>
      <SafeAreaView style={safeAreaStyle} edges={edges ?? resolved.edges}>
        {inHeroSheet ? null : (
          <SystemBars style={layoutStatusBarToSystemBarStyle(statusBarStyle, isDark)} />
        )}
        {backdrop === 'wash' ? (
          <LinearGradient
            colors={colors.gradients.screenWash.colors}
            locations={colors.gradients.screenWash.locations}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {brandBackdrop ? (
          <LayoutHeroBackdrop
            scrollY={scroll.scrollY}
            height={backdropHeight}
            parallax={parallax}
            glow={heroBackdrop === 'brandGlow'}
          />
        ) : null}
        {headerFloats ? null : headerNode}
        {content}
        {headerFloats ? headerNode : null}
      </SafeAreaView>
    </LayoutContext.Provider>
  );
};

export const Layout = memo(LayoutComponent);

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
