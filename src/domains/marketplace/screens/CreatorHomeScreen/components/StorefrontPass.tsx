import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Camera, Copy, Link2, Lock, RotateCw } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  AnimatedNumber,
  Box,
  Image,
  Pressable,
  Skeleton,
  SocialPlatformIcon,
  Text,
  TierBadge,
  useLayoutInView,
  useLoopClock,
} from '@/shared/ui';
import type { MediaKitCardModel } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { orderPlatforms } from '../utils/platformsLayout';
import { PassSheen } from './PassSheen';
import { PassSlot } from './PassSlot';

/** Resting pose: tipped back and turned a little, like a card propped on a shop counter. */
const TILT_X = 12;
const TILT_Y = 8;
const TILT_Z = 1.5;
const PERSPECTIVE = 900;
/** Platform marks shown on the card; the reach caption still counts all of them. */
const MAX_MARKS = 4;
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const NO_VALUE = '—';

type Hero = CreatorHomeScreenModel['hero'];
type Platforms = CreatorHomeScreenModel['platforms'];

interface StorefrontPassProps {
  hero: Hero;
  platforms: Platforms;
  /** Followers across every linked account; `null` while none reports a count. */
  reach: number | null;
  mediaKit: MediaKitCardModel;
  onOpenPreview: () => void;
  onAddPhoto: () => void;
  onLinkPlatform: () => void;
}

const PassHead = memo<{ hero: Hero; onAddPhoto: () => void }>(({ hero, onAddPhoto }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const { primaryPlatform } = hero;
  const name = hero.displayName || t('marketplace.creatorHome.greetingFallback');

  return (
    <Box row align="center" gap="md">
      {hero.avatarUrl ? (
        <Image uri={hero.avatarUrl} size={sizes.avatar.lg} borderRadius="md" />
      ) : (
        <PassSlot
          icon={Camera}
          label={t('marketplace.creatorHome.storefront.pass.addPhoto')}
          onPress={onAddPhoto}
          square={sizes.avatar.lg}
        />
      )}
      <Box flex={1} gap="xs">
        <Box row align="center" gap="xs">
          <Box style={styles.shrink}>
            <Text variant="title" numberOfLines={1}>
              {name}
            </Text>
          </Box>
          {hero.isVerified ? (
            <BadgeCheck
              size={sizes.icon.sm}
              color={colors.premium.main}
              accessibilityLabel={t('marketplace.creatorHome.verified')}
            />
          ) : null}
        </Box>
        {primaryPlatform ? (
          <Box row align="center" gap="xs">
            {isSocialPlatform(primaryPlatform.platform) ? (
              <SocialPlatformIcon
                platform={primaryPlatform.platform}
                size={sizes.icon.xs}
                color={colors.text.secondary}
              />
            ) : null}
            <Box style={styles.shrink}>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                @{primaryPlatform.username}
              </Text>
            </Box>
          </Box>
        ) : hero.avatarUrl ? null : (
          <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
            {t('marketplace.creatorHome.storefront.pass.addPhotoHint')}
          </Text>
        )}
      </Box>
      {hero.tier ? (
        <Box alignSelf="flex-start">
          <TierBadge tier={hero.tier} size="sm" />
        </Box>
      ) : null}
    </Box>
  );
});

const PassReach = memo<{ platforms: Platforms; reach: number | null; onLinkPlatform: () => void }>(
  ({ platforms, reach, onLinkPlatform }) => {
    const { t } = useTranslation();
    const { colors, sizes, typography } = useTheme();
    const styles = useStyles(
      ({ borderWidths, spacing }): Record<'mark' | 'stacked', ViewStyle> => {
        const mark = { borderWidth: borderWidths.md, borderColor: colors.surface.elevated };
        // Each mark tucks under the one before it, like a fanned hand of chips.
        return { mark, stacked: { ...mark, marginStart: -spacing.sm } };
      },
      [colors.surface.elevated],
    );

    if (platforms.isLoading) {
      return <Skeleton width="55%" height={typography.h1.lineHeight} borderRadius="xs" />;
    }
    if (platforms.items.length === 0) {
      return (
        <PassSlot
          icon={Link2}
          label={t('marketplace.creatorHome.storefront.pass.linkPlatform')}
          onPress={onLinkPlatform}
        />
      );
    }

    const marks = orderPlatforms(platforms.items).slice(0, MAX_MARKS);
    return (
      <Box row align="flex-end" justify="space-between" gap="md">
        <Box gap="xs" flex={1} align='flex-start'>
          {reach === null ? (
            <Text variant="h1" color={colors.brand.text}>
              {NO_VALUE}
            </Text>
          ) : (
            <AnimatedNumber value={formatNumber(reach, COMPACT)} variant="h1" color={colors.brand.text} />
          )}
          <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
            {t('account.mediaKit.showcase.stage.reach', { count: platforms.items.length })}
          </Text>
        </Box>
        <Box row>
          {marks.map((platform, index) => (
            <Box
              key={platform.id}
              width={sizes.avatar.sm}
              height={sizes.avatar.sm}
              borderRadius="full"
              bg={colors.surface.main}
              align="center"
              justify="center"
              style={index === 0 ? styles.mark : styles.stacked}
            >
              {isSocialPlatform(platform.platform) ? (
                <SocialPlatformIcon platform={platform.platform} size={sizes.icon.sm} color={colors.brand.text} />
              ) : (
                <Link2 size={sizes.icon.sm} color={colors.brand.text} />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
);

/** The kit link along a torn-ticket edge, with what a brand gets when it opens it. */
const PassLink = memo<{ mediaKit: MediaKitCardModel }>(({ mediaKit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'edge', ViewStyle> => ({
      edge: { borderTopWidth: borderWidths.thin, borderStyle: 'dashed', borderColor: colors.border.strong },
    }),
    [colors.border.strong],
  );
  const { status, linkLabel, isPublic, share } = mediaKit;

  const renderBody = () => {
    if (status === 'loading') {
      return <Skeleton width="60%" height={sizes.icon.md} borderRadius="xs" />;
    }
    if (status === 'error' || !linkLabel) {
      return (
        <Pressable
          row
          align="center"
          gap="xs"
          minHeight={sizes.iconButton.md}
          onPress={mediaKit.onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.creatorHome.storefront.pass.linkFailed')}
        >
          <RotateCw size={sizes.icon.xs} color={colors.status.danger.main} />
          <Text variant="caption" color={colors.status.danger.text}>
            {t('marketplace.creatorHome.storefront.pass.linkFailed')}
          </Text>
        </Pressable>
      );
    }
    return (
      <>
        <Box flex={1} row align="center" gap="xs">
          <Link2 size={sizes.icon.xs} color={colors.interactive.text} />
          <Box flex={1}>
            <Text
              variant="bodyMedium"
              color={colors.interactive.text}
              numberOfLines={1}
              accessibilityLabel={t('account.mediaKit.linkLabel')}
            >
              {linkLabel}
            </Text>
          </Box>
        </Box>
        {isPublic === false ? (
          <Box row align="center" gap="xs" minHeight={sizes.iconButton.md}>
            <Lock size={sizes.icon.xs} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary}>
              {t('account.mediaKit.visibility.hidden')}
            </Text>
          </Box>
        ) : (
          <Pressable
            row
            align="center"
            gap="xs"
            px="sm"
            minHeight={sizes.iconButton.md}
            onPress={share.onCopy}
            disabled={!share.isReady || share.isSharing}
            accessibilityRole="button"
            accessibilityLabel={t('account.mediaKit.share.copy')}
          >
            <Copy size={sizes.icon.xs} color={colors.text.secondary} />
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.creatorHome.storefront.pass.copy')}
            </Text>
          </Pressable>
        )}
      </>
    );
  };

  return (
    <Box row align="center" gap="sm" pt="sm" style={styles.edge}>
      {renderBody()}
    </Box>
  );
});

/**
 * The creator's storefront as brands meet it: a laminated pass tipped back in 3D over the
 * navy hero, light sweeping across it now and then. Pressing straightens it (spring) and
 * opens the brand's-eye preview. Empty fields are dashed slots that open the step that
 * fills them (photo, first platform). The preview is also on the share bar for screen
 * readers, so the card itself stays out of the accessibility tree and its controls stay
 * reachable.
 */
const StorefrontPassComponent: React.FC<StorefrontPassProps> = ({
  hero,
  platforms,
  reach,
  mediaKit,
  onOpenPreview,
  onAddPhoto,
  onLinkPlatform,
}) => {
  const { colors, radii, shadows, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const { ref, onLayout: onInViewLayout, visible } = useLayoutInView({ track: true });
  const clock = useLoopClock(motion.loop.passSheen, visible && !reduceMotion);
  const [width, setWidth] = useState(0);
  const flat = useSharedValue(0);
  const turn = isRTL ? -1 : 1;

  const styles = useStyles(
    ({ spacing, borderWidths }): Record<'pose' | 'card', ViewStyle> => ({
      pose: {
        borderRadius: radii.xl,
        backgroundColor: colors.storefront.pass[0],
        ...shadows.lg,
      },
      card: {
        borderRadius: radii.xl,
        overflow: 'hidden',
        borderWidth: borderWidths.thin,
        borderColor: colors.storefront.passRim,
        padding: spacing.lg,
        gap: spacing.lg,
      },
    }),
    [colors.storefront, radii.xl, shadows.lg],
  );

  const poseStyle = useAnimatedStyle(() => {
    const rest = 1 - flat.value;
    return {
      transform: [
        { perspective: PERSPECTIVE },
        { rotateX: `${TILT_X * rest}deg` },
        { rotateY: `${-TILT_Y * turn * rest}deg` },
        { rotateZ: `${TILT_Z * turn * rest}deg` },
      ],
    };
  }, [turn]);

  const straighten = useCallback(() => {
    flat.value = reduceMotion ? 1 : withSpring(1, motion.spring);
  }, [flat, reduceMotion]);
  const settle = useCallback(() => {
    flat.value = reduceMotion ? 0 : withSpring(0, motion.spring);
  }, [flat, reduceMotion]);

  const onCardLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(Math.round(event.nativeEvent.layout.width));
  }, []);

  return (
    <Animated.View ref={ref} onLayout={onInViewLayout} style={[styles.pose, poseStyle]}>
      <Pressable
        style={styles.card}
        onPress={onOpenPreview}
        onPressIn={straighten}
        onPressOut={settle}
        onLayout={onCardLayout}
        activeOpacity={1}
        accessible={false}
      >
        <LinearGradient
          colors={colors.storefront.pass}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <PassSheen clock={reduceMotion ? null : clock} width={width} />
        <PassHead hero={hero} onAddPhoto={onAddPhoto} />
        <PassReach platforms={platforms} reach={reach} onLinkPlatform={onLinkPlatform} />
        <PassLink mediaKit={mediaKit} />
      </Pressable>
    </Animated.View>
  );
};

export const StorefrontPass = memo(StorefrontPassComponent);
