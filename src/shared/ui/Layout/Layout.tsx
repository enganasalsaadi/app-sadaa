import React, { useEffect, useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  type LayoutChangeEvent,
  type ScrollViewProps,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { BlurView } from '@react-native-community/blur';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useTheme, moderateScale } from '@/core/theme';
import { env } from '@/core/config/env';
import { goBack } from '@/core/navigation';
import { layoutStatusBarToSystemBarStyle } from '@/shared/utils';
import {
  useScrollHandler,
  useScrollContext,
} from '@/shared/context/ScrollContext';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import type { BoxProps } from '../primitives/Box';
import type { SpacingToken } from '@/core/theme/types';
import { LAYOUT_DEFAULT_PX, LAYOUT_DEFAULT_PY } from './constants';
import { EndScreenPadding } from './EndScreenPadding';
import type { EndScreenPaddingProps } from './EndScreenPadding';
import { LayoutKeyboardContainer } from './LayoutKeyboardContainer';
import { ScreenHeader } from '../ScreenHeader';
import type { ScreenHeaderProps } from '../ScreenHeader';
import LinearGradient from 'react-native-linear-gradient';
import { CustomButton } from '../CustomButton';

const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right'];
const BLUR_CIRCLE_SIZE = moderateScale(36);
const BLUR_ICON_SIZE = moderateScale(18);
/** Height of the default (`lg`) CustomButton rendered as the CTA. */
const CTA_BUTTON_HEIGHT = moderateScale(52);

export interface LayoutCtaButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** Content rendered above the button (e.g. totals row, room count) */
  topContent?: React.ReactNode;
  /** When true, background is always solid regardless of scroll position */
  alwaysSolid?: boolean;
}

export interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onBackPress?: () => void;
  /** Scroll offset where the header background reaches full opacity. Default: 200 */
  transitionEnd?: number;
  /** Scroll offset where the inline title fully appears near the back button. Defaults to transitionEnd. */
  titleOffset?: number;
}

export interface LayoutProps {
  children: React.ReactNode;
  edges?: Edge[];
  bg?: string;
  contentBg?: string;
  withScroll?: boolean;
  keyboardAvoiding?: boolean;
  showNonProdBanner?: boolean;
  contentPadding?: boolean;
  defaultPx?: SpacingToken;
  defaultPy?: SpacingToken;
  scrollViewProps?: Omit<
    ScrollViewProps,
    'children' | 'keyboardShouldPersistTaps'
  >;
  containerProps?: Omit<BoxProps, 'children'>;
  onContentLayout?: (e: LayoutChangeEvent) => void;
  showEndScreenPadding?: boolean;
  endScreenPaddingProps?: Omit<EndScreenPaddingProps, 'bg'>;
  statusBarStyle?: 'auto' | 'light' | 'dark';
  stickyHeader?: React.ReactNode;
  withGradient?: boolean;
  /**
   * Enables a hero header that starts fully transparent and transitions to solid on scroll.
   * When set, `edges` defaults to `['left', 'right']` so the hero covers the status-bar area.
   * `statusBarStyle` defaults to `'light'` (white icons over the hero image).
   */
  heroHeader?: HeroHeaderProps;
  /**
   * When set, renders a fixed ScreenHeader above the scroll/content area.
   * Automatically sets edges to ['left', 'right'] when fillStatusBar is true,
   * so the header handles the top safe-area inset itself.
   */
  screenHeader?: ScreenHeaderProps;
  /**
   * Rendered absolutely at the bottom of the screen, outside the scroll area.
   * Useful for fixed CTAs like a "Book Now" button.
   */
  fixedBottom?: React.ReactNode;
  /**
   * Standard animated CTA button fixed at the bottom.
   * Background fades from transparent → solid as the user scrolls (driven by heroHeader.transitionEnd).
   * Use this instead of fixedBottom when you just need a single primary action button.
   */
  ctaButton?: LayoutCtaButtonProps;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  edges,
  bg,
  contentBg,
  withScroll = true,
  keyboardAvoiding = true,
  showNonProdBanner = false,
  contentPadding = true,
  defaultPx = LAYOUT_DEFAULT_PX,
  defaultPy = LAYOUT_DEFAULT_PY,
  scrollViewProps,
  containerProps,
  onContentLayout,
  showEndScreenPadding = true,
  endScreenPaddingProps,
  statusBarStyle,
  stickyHeader,
  withGradient = false,
  heroHeader,
  screenHeader,
  fixedBottom,
  ctaButton,
}) => {
  const { colors, spacing, zIndices, isDark, isRTL } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollHandler = useScrollHandler();
  const scrollCtx = useScrollContext();
  // Always rendering the full tree (no conditional early return) avoids the
  // structural reconciliation that causes Android's "ghost" artifact.
  const contentOpacity = useSharedValue(1);
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const resolvedEdges: Edge[] =
    edges ??
    (heroHeader || screenHeader?.fillStatusBar
      ? ['left', 'right']
      : DEFAULT_EDGES);
  const resolvedStatusBarStyle =
    statusBarStyle ?? (heroHeader ? 'light' : 'auto');
  const screenBg = bg ?? colors.layout.base;

  const resolvedInnerBg = useMemo(() => {
    if (containerProps?.bg !== undefined) return containerProps.bg;
    if (screenBg === colors.layout.base && contentBg !== undefined)
      return contentBg;
    return undefined;
  }, [containerProps?.bg, contentBg, colors.layout.base, screenBg]);

  const systemBarsStyle = layoutStatusBarToSystemBarStyle(
    resolvedStatusBarStyle,
    isDark,
  );
  const showBanner = showNonProdBanner ?? env.APP_ENV !== 'production';

  const padded = contentPadding !== false;
  const paddingProps: Pick<BoxProps, 'px' | 'py'> | Record<string, never> =
    padded ? { px: defaultPx, py: defaultPy } : {};

  const innerBoxProps: BoxProps = {
    flex: 1,
    ...paddingProps,
    ...containerProps,
    bg: resolvedInnerBg,
  };

  const {
    style: scrollOuterStyle,
    contentContainerStyle: scrollUserContentStyle,
    ...scrollRest
  } = scrollViewProps ?? {};

  const scrollContentStyle = useMemo(() => {
    const padStyle =
      padded && withScroll
        ? {
            paddingHorizontal: spacing[defaultPx],
            paddingVertical: spacing[defaultPy],
          }
        : {};
    return [styles.scrollContent, padStyle, scrollUserContentStyle];
  }, [
    defaultPx,
    defaultPy,
    padded,
    scrollUserContentStyle,
    spacing,
    withScroll,
  ]);

  const scrollInnerProps: BoxProps = {
    flex: 1,
    ...containerProps,
    bg: resolvedInnerBg,
  };

  // Extra scroll clearance so the fixed CTA never covers the last content.
  const ctaOffset = useMemo(() => {
    if (!ctaButton) return 0;
    return CTA_BUTTON_HEIGHT + spacing['5xl'] + insets.bottom + spacing.md;
  }, [ctaButton, insets.bottom, spacing]);

  const resolvedEndPaddingProps = useMemo<Omit<EndScreenPaddingProps, 'bg'>>(
    () => ({
      offset: (endScreenPaddingProps?.offset ?? 0) + ctaOffset,
      withInsets: endScreenPaddingProps?.withInsets ?? true,
      ...endScreenPaddingProps,
    }),
    [ctaOffset, endScreenPaddingProps],
  );

  // Hero header: reads scrollY that Layout's own scroll handler already updates —
  // no second scroll handler needed anywhere.
  const heroScrollY = heroHeader ? scrollCtx?.scrollY : undefined;
  const heroTransitionEnd = heroHeader?.transitionEnd ?? 200;
  const titleAppearOffset = heroHeader?.titleOffset ?? heroTransitionEnd;

  const scrollContentHeight = useSharedValue(0);
  const scrollContainerHeight = useSharedValue(0);

  const headerBgStyle = useAnimatedStyle(() => {
    'worklet';
    if (!heroScrollY) return { opacity: 0 };
    return {
      opacity: interpolate(
        heroScrollY.value,
        [0, heroTransitionEnd],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  const ctaAlwaysSolid = ctaButton?.alwaysSolid ?? false;

  const ctaBgStyle = useAnimatedStyle(() => {
    'worklet';
    if (ctaAlwaysSolid || !heroScrollY)
      return { opacity: 1, backgroundColor: colors.surface.main };
    const contentH = scrollContentHeight.value;
    const containerH = scrollContainerHeight.value;
    if (contentH <= 0 || containerH <= 0) return { opacity: 1 };
    const maxScroll = contentH - containerH;
    const distanceFromBottom = maxScroll - heroScrollY.value;
    return {
      opacity: interpolate(
        distanceFromBottom,
        [0, 160],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      borderTopWidth: interpolate(
        distanceFromBottom,
        [0, 160],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  const inlineTitleStyle = useAnimatedStyle(() => {
    'worklet';
    const slideFrom = isRTL ? 16 : -16;
    if (!heroScrollY)
      return { opacity: 0, transform: [{ translateX: slideFrom }] };
    const from = titleAppearOffset * 0.8;
    const to = titleAppearOffset * 1.2;
    return {
      opacity: interpolate(
        heroScrollY.value,
        [from, to],
        [0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            heroScrollY.value,
            [from, to],
            [slideFrom, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  // Reset stale scrollY from a previous screen so hero header starts transparent.
  // The shared value is stable for the lifetime of the ScrollContext provider.
  const sharedScrollY = scrollCtx?.scrollY;
  useEffect(() => {
    if (sharedScrollY) {
      sharedScrollY.value = 0;
    }
  }, [sharedScrollY]);

  const heroHeaderHeight = insets.top + moderateScale(56);

  const ctaContentStyle = useMemo(
    () => ({ paddingBottom: insets.bottom + spacing.md }),
    [insets.bottom, spacing.md],
  );
  const heroRowStyle = useMemo(
    () => ({ paddingTop: insets.top + spacing.md }),
    [insets.top, spacing.md],
  );

  const body = withScroll ? (
    <Animated.ScrollView
      removeClippedSubviews={true}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      style={[styles.flex, scrollOuterStyle]}
      contentContainerStyle={scrollContentStyle}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={32}
      onContentSizeChange={(_, h) => {
        scrollContentHeight.value = h;
      }}
      onLayout={e => {
        scrollContainerHeight.value = e.nativeEvent.layout.height;
      }}
      {...scrollRest}
    >
      <Box {...scrollInnerProps}>{children}</Box>
      {showEndScreenPadding ? (
        <EndScreenPadding {...resolvedEndPaddingProps} />
      ) : null}
    </Animated.ScrollView>
  ) : (
    <Box {...innerBoxProps} onLayout={onContentLayout}>
      {children}
      {showEndScreenPadding ? (
        <EndScreenPadding {...resolvedEndPaddingProps} />
      ) : null}
    </Box>
  );

  const wrappedBody = keyboardAvoiding ? (
    <LayoutKeyboardContainer>{body}</LayoutKeyboardContainer>
  ) : (
    body
  );

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: screenBg }]}
      edges={resolvedEdges}
    >
      <SystemBars style={systemBarsStyle} />

      {withGradient && (
        <LinearGradient
          colors={colors.gradients.screenWash.colors}
          style={StyleSheet.absoluteFill}
          locations={colors.gradients.screenWash.locations}
        />
      )}

      <Animated.View style={[styles.flex, contentAnimStyle]}>
        <Box flex={1} position="relative">
          {showBanner ? (
            <Box
              pointerEvents="none"
              position="absolute"
              zIndex={1000}
              bg={colors.status.danger.main}
              style={styles.nonProdStripe}
            />
          ) : null}

          {stickyHeader ? <Box zIndex={10}>{stickyHeader}</Box> : null}

          {screenHeader != null ? <ScreenHeader {...screenHeader} /> : null}

          {wrappedBody}

          {fixedBottom != null ? (
            <Box
              position="absolute"
              style={styles.fixedBottom}
              zIndex={zIndices.sticky}
            >
              {fixedBottom}
            </Box>
          ) : null}

          {ctaButton != null ? (
            <Box
              position="absolute"
              style={styles.fixedBottom}
              zIndex={zIndices.sticky}
            >
              <Box>
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: screenBg,
                      borderColor: colors.border.default,
                    },
                    ctaBgStyle,
                  ]}
                />
                <Box px="2xl" pt="md" style={ctaContentStyle}>
                  {ctaButton.topContent != null ? (
                    <Box mb="sm">{ctaButton.topContent}</Box>
                  ) : null}
                  {ctaButton.isLoading ? (
                    <Box
                      height={CTA_BUTTON_HEIGHT}
                      align="center"
                      justify="center"
                    >
                      <LottieView
                        source={
                          isDark
                            ? require('./../../../assets/lottie/loading_light.json')
                            : require('../../../assets/lottie/loading.json')
                        }
                        autoPlay
                        loop
                        style={styles.ctaLottie}
                      />
                    </Box>
                  ) : (
                    <Box mt="sm">
                      <CustomButton
                        onPress={ctaButton.onPress}
                        title={ctaButton.label}
                        disabled={ctaButton.disabled}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : null}

          {heroHeader !== undefined ? (
            <Animated.View
              style={[
                styles.heroHeaderContainer,
                { height: heroHeaderHeight, zIndex: zIndices.header },
              ]}
              pointerEvents="box-none"
            >
              {/* Animated solid background — opacity driven by scroll */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: colors.surface.main },
                  headerBgStyle,
                ]}
              />

              {/* Header row */}
              <Box
                row
                align="center"
                pb="md"
                px="lg"
                style={heroRowStyle}
                pointerEvents="box-none"
              >
                {/* Back button with blur circle */}
                <Pressable
                  onPress={heroHeader.onBackPress ?? goBack}
                  hitSlop={12}
                >
                  <Box
                    width={BLUR_CIRCLE_SIZE}
                    height={BLUR_CIRCLE_SIZE}
                    borderRadius="full"
                    align="center"
                    justify="center"
                    overflow="hidden"
                    bg={colors.overlay}
                  >
                    <BlurView
                      style={StyleSheet.absoluteFill}
                      blurType={'light'}
                      blurAmount={8}
                      reducedTransparencyFallbackColor={colors.overlay}
                    />
                    {isRTL ? (
                      <ArrowRight
                        size={BLUR_ICON_SIZE}
                        color={colors.text.onBrand}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowLeft
                        size={BLUR_ICON_SIZE}
                        color={colors.text.onBrand}
                        strokeWidth={2.5}
                      />
                    )}
                  </Box>
                </Pressable>

                {/* Inline title — slides in near back button when scrolled */}
                {heroHeader.title ? (
                  <Animated.View
                    style={[styles.inlineTitleWrapper, inlineTitleStyle]}
                    pointerEvents="none"
                  >
                    <Text
                      variant="title"
                      color={colors.text.primary}
                      numberOfLines={1}
                      ms="sm"
                    >
                      {heroHeader.title}
                    </Text>
                  </Animated.View>
                ) : (
                  <Box flex={1} />
                )}

                {heroHeader.rightContent != null ? (
                  <Box align="flex-end" justify="center">
                    {heroHeader.rightContent}
                  </Box>
                ) : null}
              </Box>
            </Animated.View>
          ) : null}
        </Box>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  nonProdStripe: { top: 0, start: 0, end: 0, height: 2 },
  heroHeaderContainer: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
  },
  inlineTitleWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  fixedBottom: {
    bottom: 0,
    start: 0,
    end: 0,
  },
  ctaLottie: {
    width: moderateScale(120),
    height: moderateScale(100),
    marginTop: moderateScale(-25),
    marginBottom: moderateScale(-25),
  },
});
