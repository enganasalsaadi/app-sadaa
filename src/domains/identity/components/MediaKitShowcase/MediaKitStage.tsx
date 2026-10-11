import React, { memo, useCallback, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text, useLayoutInView } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import { stageHandle } from '../../utils/mediaKitStage';
import { MediaKitRise } from './MediaKitRise';
import { STAGE_COVER_SHARE } from './MediaKitStageBackdrop';
import {
  MediaKitStageCanvas,
  STAGE_BOX,
  STAGE_PHOTO as PHOTO,
  STAGE_RING_RADIUS as RING_RADIUS,
  STAGE_RING_WIDTH as RING_WIDTH,
  STAGE_WAVE_HEIGHT,
} from './MediaKitStageCanvas';
import { MediaKitStageChips } from './MediaKitStageChips';
import { MediaKitStageReach } from './MediaKitStageReach';

const SEAL = moderateScale(30);
const SEAL_INSET = moderateScale(14);
const SEAL_DELAY = 800;
const BIO_LINES = 2;
const NAME_LINES = 2;
const STEP = 80;

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

const StagePhoto = memo<{ kit: PublicMediaKit; name: string }>(({ kit, name }) => {
  const { t } = useTranslation();
  const { colors, borderWidths } = useTheme();
  const styles = useStyles(
    ({ radii }) => ({
      box: { width: STAGE_BOX, height: STAGE_BOX, alignItems: 'center' as const, justifyContent: 'center' as const },
      monogram: {
        width: PHOTO,
        height: PHOTO,
        borderRadius: radii.full,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
      seal: {
        position: 'absolute' as const,
        bottom: SEAL_INSET,
        start: SEAL_INSET,
      },
    }),
    [],
  );

  return (
    <Box style={styles.box}>
      {kit.avatar_url ? (
        <Image uri={kit.avatar_url} size={PHOTO} circle />
      ) : (
        <LinearGradient colors={colors.stage.monogram} style={styles.monogram}>
          <Text variant="h2" color={colors.text.onBrand}>
            {initialsOf(name)}
          </Text>
        </LinearGradient>
      )}
      {kit.is_verified ? (
        <Box style={styles.seal}>
          <MediaKitRise from="pop" delay={SEAL_DELAY}>
            <Box
              width={SEAL}
              height={SEAL}
              borderRadius="full"
              bg={colors.premium.main}
              borderWidth="lg"
              borderColor={colors.brand.main}
              align="center"
              justify="center"
              accessible
              accessibilityLabel={t('account.mediaKit.verifiedCreator')}
            >
              <Check
                size={SEAL - borderWidths.lg * 4}
                color={colors.brand.main}
                strokeWidth={iconStroke.bold}
              />
            </Box>
          </MediaKitRise>
        </Box>
      ) : null}
    </Box>
  );
});

interface MediaKitStageProps {
  kit: PublicMediaKit;
  nicheLabels: readonly string[];
}

/**
 * «The stage», the media kit hero: the photo at the centre of a live navy stage, echo rings
 * leaving it and a mustard-teal ring turning around it (Skia, one canvas). Under it the name,
 * handle, bio, tier · niche · city pills, then the reach moment. Waves melt the stage into the
 * page. The scene pauses once scrolled away or on blur, and holds still under reduced motion.
 * A cover photo, when set, shows faintly at the top and melts into the navy lower down, so it
 * never ends in a visible edge. It is only as tall as that fade, so no more of it is decoded.
 */
const MediaKitStageComponent: React.FC<MediaKitStageProps> = ({ kit, nicheLabels }) => {
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const { ref, onLayout: onInViewLayout, visible } = useLayoutInView({ track: true });
  const [height, setHeight] = useState(0);
  const name = kit.display_name ?? kit.slug;
  const handle = stageHandle(kit.platforms);

  const padTop = top + sizes.iconButton.md + spacing.lg;
  const styles = useStyles(
    () => ({
      stage: { paddingTop: padTop, paddingBottom: STAGE_WAVE_HEIGHT + spacing.lg, overflow: 'hidden' as const },
      cover: { position: 'absolute' as const, top: 0, start: 0 },
    }),
    [padTop],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setHeight(event.nativeEvent.layout.height);
      onInViewLayout();
    },
    [onInViewLayout],
  );

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={styles.stage}>
      {kit.cover_url && height > 0 ? (
        <Image
          uri={kit.cover_url}
          width={width}
          height={height * STAGE_COVER_SHARE}
          resizeMode="cover"
          showSkeleton={false}
          containerStyle={styles.cover}
        />
      ) : null}
      <MediaKitStageCanvas
        width={width}
        height={height}
        photoX={width / 2}
        photoY={padTop + STAGE_BOX / 2}
        ringRadius={RING_RADIUS}
        ringWidth={RING_WIDTH}
        overCover={kit.cover_url !== null}
        running={visible && !reduceMotion}
      />
      <Box align="center" px="xl" gap="sm">
        <MediaKitRise from="pop">
          <StagePhoto kit={kit} name={name} />
        </MediaKitRise>
        <MediaKitRise delay={STEP * 2}>
          <Box align="center" gap="xs">
            <Text variant="h1" color={colors.text.onBrand} align="center" numberOfLines={NAME_LINES}>
              {name}
            </Text>
            {handle ? (
              <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1} writingDirection="ltr">
                {`@${handle}`}
              </Text>
            ) : null}
          </Box>
        </MediaKitRise>
        {kit.bio ? (
          <MediaKitRise delay={STEP * 3}>
            <Text variant="bodySmall" color={colors.text.onBrandMuted} align="center" numberOfLines={BIO_LINES}>
              {kit.bio}
            </Text>
          </MediaKitRise>
        ) : null}
        <MediaKitRise delay={STEP * 4}>
          <MediaKitStageChips kit={kit} nicheLabels={nicheLabels} />
        </MediaKitRise>
        <Box mt="md" width="100%" align="center">
          <MediaKitStageReach platforms={kit.platforms} />
        </Box>
      </Box>
    </Animated.View>
  );
};

export const MediaKitStage = memo(MediaKitStageComponent);
