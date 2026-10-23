import React, { memo, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Check, Clock, ExternalLink, Image as ImageIcon, Link2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, FileViewer, GradientSurface, Image, Pressable, ProgressBar, Text } from '@/shared/ui';
import { useDealViewer } from '../../../hooks/useDealViewer';
import type { DealFile, DealRef } from '../../../types';

const RING = moderateScale(150);
const CORE = moderateScale(96);
const RIPPLE_SCALE = 1.55;
/** Thumbnails shown in the proofs row; the count says the rest. */
const PROOF_PEEK = 3;
const EASE_OUT = Easing.bezier(0.2, 0.7, 0.3, 1);
/** Two ripples half a cycle apart, slower than a status dot: a broadcast, not a blink. */
const RIPPLE_MS = motion.loop.statusPulse * 1.2;

export interface PublishOnAirProps {
  verified: boolean;
  title: string;
  body: string;
  /** The link as handed in (host + path, bidi-isolated), or «no link». */
  link: string;
  /** The link is on an allow-listed platform host, so it may leave the app. */
  canOpen: boolean;
  proofs: DealFile[];
  /** The deal the proofs belong to (a viewed proof refreshes its link from it). */
  dealRef: DealRef;
  /** «47 h» until auto-verification; `null` once verified or while paused (then `autoNote`). */
  autoIn: string | null;
  autoNote: string | null;
  /** Share of the verify window already gone (0–1). */
  share: number;
  onOpenLink: () => void;
  onBack: () => void;
}

const Ripple = memo<{ progress: SharedValue<number>; style: ViewStyle }>(({ progress, style }) => {
  const animated = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 1 + (RIPPLE_SCALE - 1) * progress.value }],
  }));
  return <Animated.View pointerEvents="none" style={[style, animated]} />;
});

/** The screenshots handed in: up to three overlapping thumbnails and the count; a tap opens the viewer. */
const ProofPeek = memo<{ proofs: DealFile[]; dealRef: DealRef }>(({ proofs, dealRef }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const viewer = useDealViewer(proofs, dealRef);
  const shown = viewer.props.files.slice(0, PROOF_PEEK);
  const openFirst = viewer.openAt;
  const open = useCallback(() => openFirst(0), [openFirst]);
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'peek' | 'thumb' | 'overlap', ViewStyle> => ({
      peek: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: sizes.button.md },
      thumb: {
        width: sizes.avatar.sm,
        height: sizes.avatar.sm,
        borderRadius: radii.sm,
        overflow: 'hidden',
        borderWidth: borderWidths.md,
        borderColor: colors.glass.border,
        backgroundColor: colors.glass.badge,
      },
      overlap: { marginStart: -spacing.md },
    }),
    [colors.glass.badge, colors.glass.border, sizes.avatar.sm, sizes.button.md],
  );
  const count = (
    <Text variant="bodyMedium" color={colors.text.onBrand}>
      {formatNumber(proofs.length)}
    </Text>
  );
  if (shown.length === 0) return count;
  return (
    <>
      <Pressable
        style={styles.peek}
        onPress={open}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.deals.publish.creator.aired.proofsOpen', { count: proofs.length })}
      >
        <Box row>
          {shown.map((file, index) => (
            <Box key={file.id} style={index > 0 ? [styles.thumb, styles.overlap] : styles.thumb} align="center" justify="center">
              {file.kind === 'image' && file.url ? (
                <Image uri={file.url} size={sizes.avatar.sm} resizeMode="cover" />
              ) : (
                <ImageIcon size={sizes.icon.xs} color={colors.text.onBrand} />
              )}
            </Box>
          ))}
        </Box>
        {count}
      </Pressable>
      <FileViewer {...viewer.props} refreshUrl={viewer.refreshUrl} />
    </>
  );
});

/**
 * A handed-in post (approved «على الهواء»): the lamp became a broadcast ring sending out slow
 * ripples while the brand checks it (resting when blurred / reduced motion); verified, it settles
 * into a teal stamp. A glass card keeps what was sent and how much of the auto-verify window is gone.
 * The stage sits centred and scrolls when it can't fit (short screens, large text); the gradient
 * runs to the device edge and the back button rests just above the home indicator.
 */
const PublishOnAirComponent: React.FC<PublishOnAirProps> = ({
  verified,
  title,
  body,
  link,
  canOpen,
  proofs,
  dealRef,
  autoIn,
  autoNote,
  share,
  onOpenLink,
  onBack,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const first = useSharedValue(0);
  const second = useSharedValue(0);

  useEffect(() => {
    if (verified || reduceMotion || !focused) return;
    const cycle = withTiming(1, { duration: RIPPLE_MS, easing: EASE_OUT });
    first.value = 0;
    second.value = 0;
    first.value = withRepeat(cycle, -1, false);
    second.value = withDelay(RIPPLE_MS / 2, withRepeat(cycle, -1, false));
    return () => {
      cancelAnimation(first);
      cancelAnimation(second);
    };
  }, [first, focused, reduceMotion, second, verified]);

  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<
      'scroll' | 'stage' | 'ring' | 'ripple' | 'core' | 'card' | 'row' | 'rowLabel' | 'value' | 'footer',
      ViewStyle
    > &
      Record<'link', TextStyle> => ({
      scroll: { flex: 1 },
      // Grows to the viewport so the stage centres; taller than the viewport, it just scrolls.
      stage: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing['2xl'],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing['2xl'],
      },
      ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
      ripple: {
        ...StyleSheet.absoluteFill,
        borderRadius: radii.full,
        borderWidth: borderWidths.md,
        borderColor: colors.live.ring,
      },
      core: {
        width: CORE,
        height: CORE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.live.lampOnFill,
        borderWidth: borderWidths.md,
        borderColor: colors.live.ring,
        borderStyle: verified ? 'dashed' : 'solid',
      },
      card: {
        alignSelf: 'stretch',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: sizes.button.md },
      rowLabel: { flex: 1 },
      value: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
      link: { flexShrink: 1, textDecorationLine: canOpen ? 'underline' : 'none' },
      // The only bottom inset on this screen (the layout leaves it out so the gradient reaches the edge).
      footer: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: Math.max(bottom, spacing.md) + spacing.sm,
      },
    }),
    [bottom, canOpen, colors, sizes.button.md, verified],
  );

  const linkValue = (
    <Box style={styles.value}>
      <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={1} style={styles.link}>
        {link}
      </Text>
      {canOpen ? <ExternalLink size={sizes.icon.xs} color={colors.glass.iconInteractive} /> : null}
    </Box>
  );
  const linkLabel = (
    <>
      <Link2 size={sizes.icon.sm} color={colors.glass.iconInteractive} />
      <Text variant="bodySmall" color={colors.text.onBrandMuted} style={styles.rowLabel}>
        {t('marketplace.deals.publish.creator.aired.link')}
      </Text>
    </>
  );

  return (
    <GradientSurface variant="live" flex={1}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.stage} showsVerticalScrollIndicator={false}>
        <Box style={styles.ring}>
          {verified || reduceMotion ? null : (
            <>
              <Ripple progress={first} style={styles.ripple} />
              <Ripple progress={second} style={styles.ripple} />
            </>
          )}
          <Box style={styles.core}>
            {verified ? (
              <Check size={sizes.icon.xl} color={colors.text.onBrand} />
            ) : (
              <Text variant="buttonSmall" color={colors.text.onBrand}>
                {t('marketplace.deals.publish.creator.lamp')}
              </Text>
            )}
          </Box>
        </Box>
        <Box gap="sm">
          <Text variant="h2" color={colors.text.onBrand} align="center" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body" color={colors.text.onBrandMuted} align="center">
            {body}
          </Text>
        </Box>
        <Box style={styles.card}>
          {canOpen ? (
            <Pressable
              style={styles.row}
              onPress={onOpenLink}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel={t('marketplace.deals.publish.creator.aired.open')}
            >
              {linkLabel}
              {linkValue}
            </Pressable>
          ) : (
            <Box style={styles.row}>
              {linkLabel}
              {linkValue}
            </Box>
          )}
          <Box style={styles.row}>
            <ImageIcon size={sizes.icon.sm} color={colors.glass.iconInteractive} />
            <Text variant="bodySmall" color={colors.text.onBrandMuted} style={styles.rowLabel}>
              {t('marketplace.deals.publish.creator.aired.proofs')}
            </Text>
            <ProofPeek proofs={proofs} dealRef={dealRef} />
          </Box>
          {verified ? null : (
            <Box gap="sm">
              <Box style={styles.row}>
                <Clock size={sizes.icon.sm} color={colors.glass.iconInteractive} />
                <Text variant="bodySmall" color={colors.text.onBrandMuted} style={styles.rowLabel}>
                  {autoIn ? t('marketplace.deals.publish.creator.aired.auto') : autoNote}
                </Text>
                {autoIn ? (
                  <Text variant="bodyMedium" color={colors.text.onBrand}>
                    {autoIn}
                  </Text>
                ) : null}
              </Box>
              {autoIn ? (
                <ProgressBar
                  surface="brand"
                  value={share}
                  accessibilityLabel={`${t('marketplace.deals.publish.creator.aired.auto')} ${autoIn}`}
                />
              ) : null}
            </Box>
          )}
        </Box>
      </ScrollView>
      <Box style={styles.footer}>
        <CustomButton
          title={t('marketplace.deals.publish.creator.aired.back')}
          variant="onBrand"
          size="lg"
          fullWidth
          onPress={onBack}
        />
      </Box>
    </GradientSurface>
  );
};

export const PublishOnAir = memo(PublishOnAirComponent);
