import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Canvas,
  DashPathEffect,
  Path,
  Skia,
  type SkPath,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  ZoomIn,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { BadgeCheck, Camera } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import {
  motion,
  moderateScale,
  useStyles,
  useTheme,
  type ThemeColors,
} from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import type { ProfileStepTarget } from '../../../constants/profileSteps';
import type {
  OrbitArcState,
  OrbitSatellite,
} from '../../../utils/profileOrbit';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

/** Geometry in the orbit's own 208-unit box, scaled to the drawn size. */
const VIEW = 208;
const RING_R = 94;
/** Path length left open between two arcs (round caps eat part of it). */
const ARC_GAP = 12;
const DASH = [5, 7];
const FACE = 106;
const FACE_RIM = 3;
const BADGE = 30;
const BADGE_INSET = -4;
const SATELLITE = 40;
const SATELLITE_HIT = 44;
const POINTS_OFFSET_TOP = -9;
const POINTS_OFFSET_END = -12;
const PERCENT_H = 28;
const PERCENT_DROP = -30;
const PERCENT_PAD = 11;
const FULL_TURN = 360;
const TOP = -90;
const PULSE_SCALE = 1.6;
const PULSE_TIMES = 3;
const PULSE_DELAY = 1000;
const SATELLITE_DELAY = 400;

export const ORBIT_SIZE = moderateScale(200);
export const ORBIT_SIZE_COMPACT = moderateScale(188);

type OrbitColor = keyof ThemeColors['profile'];

/** `verified`: the single gold ring of a complete, verified profile. */
type ArcLook = OrbitArcState | 'verified';

const ARC_STYLE = {
  verified: { color: 'orbitVerified', width: 5, dashed: false },
  done: { color: 'orbitDone', width: 5, dashed: false },
  missing: { color: 'orbitTrack', width: 3.5, dashed: false },
  review: { color: 'orbitPending', width: 3.5, dashed: true },
  rejected: { color: 'orbitRejected', width: 3.5, dashed: true },
} as const satisfies Record<
  ArcLook,
  { color: OrbitColor; width: number; dashed: boolean }
>;

type Hero = ProfileScreenModel['hero'];

/** One arc per slot from the top toward the reading start: clockwise in RTL, mirrored in LTR. */
const buildArcPaths = (
  count: number,
  size: number,
  isRTL: boolean,
): SkPath[] => {
  const k = size / VIEW;
  const r = RING_R * k;
  const oval = {
    x: size / 2 - r,
    y: size / 2 - r,
    width: r * 2,
    height: r * 2,
  };
  const slot = FULL_TURN / count;
  const gap = (ARC_GAP / (2 * Math.PI * RING_R)) * FULL_TURN;
  const direction = isRTL ? 1 : -1;
  return Array.from({ length: count }, (_, index) => {
    const path = Skia.Path.Make();
    const from = count === 1 ? 0 : index * slot + gap / 2;
    const sweep = count === 1 ? FULL_TURN : slot - gap;
    path.addArc(oval, TOP + direction * from, direction * sweep);
    return path;
  });
};

interface OrbitArcProps {
  path: SkPath;
  state: ArcLook;
  /** Resolved outside the Canvas: Skia's renderer can't read React context (no `useTheme` here). */
  color: string;
  index: number;
  count: number;
  k: number;
  reveal: SharedValue<number>;
}

/** Draws its share of the single reveal sweep, so the whole ring fills once, in order. */
const OrbitArc = memo<OrbitArcProps>(
  ({ path, state, color, index, count, k, reveal }) => {
    const style = ARC_STYLE[state];
    const end = useDerivedValue(() =>
      Math.min(Math.max(reveal.value * count - index, 0), 1),
    );
    return (
      <Path
        path={path}
        style="stroke"
        strokeWidth={style.width * k}
        strokeCap="round"
        color={color}
        end={end}
      >
        {style.dashed ? (
          <DashPathEffect intervals={DASH.map(v => v * k)} />
        ) : null}
      </Path>
    );
  },
);

interface SatelliteProps {
  satellite: OrbitSatellite;
  order: number;
  size: number;
  onPress: (target: ProfileStepTarget) => void;
}

/**
 * A missing step parked on its own arc. Pops in once; the unverified KYC one sends three
 * ripples and then rests (no idle loop).
 */
const Satellite = memo<SatelliteProps>(
  ({ satellite, order, size, onPress }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const reduceMotion = useReducedMotion();
    const { step, angle } = satellite;
    const k = size / VIEW;
    const dot = SATELLITE * k;
    const Icon = step.meta.icon;
    const target = step.meta.target;
    // KYC is the one step that blocks offers and payouts: it asks for attention, briefly.
    const pulses =
      step.key === 'kyc' && step.state !== 'review' && !reduceMotion;

    const ripple = useSharedValue(0);
    useEffect(() => {
      if (!pulses) return;
      ripple.value = withDelay(
        PULSE_DELAY,
        withRepeat(
          withTiming(1, {
            duration: motion.loop.statusPulse,
            easing: Easing.out(Easing.quad),
          }),
          PULSE_TIMES,
          false,
        ),
      );
    }, [pulses, ripple]);
    const rippleStyle = useAnimatedStyle(() => ({
      opacity: ripple.value === 0 ? 0 : 1 - ripple.value,
      transform: [{ scale: 1 + (PULSE_SCALE - 1) * ripple.value }],
    }));

    const tone =
      step.state === 'review'
        ? colors.profile.orbitPending
        : step.state === 'rejected'
        ? colors.profile.orbitRejected
        : colors.profile.satelliteBorder;

    const styles = useStyles(
      ({
        radii,
        borderWidths,
        spacing,
      }): Record<'slot' | 'dot' | 'ripple' | 'points', ViewStyle> => {
        const theta = (angle * Math.PI) / 180;
        const r = RING_R * k;
        const hit = Math.max(dot, SATELLITE_HIT);
        return {
          slot: {
            position: 'absolute',
            width: hit,
            height: hit,
            start: size / 2 - r * Math.sin(theta) - hit / 2,
            top: size / 2 - r * Math.cos(theta) - hit / 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          dot: {
            width: dot,
            height: dot,
            borderRadius: radii.full,
            borderWidth: borderWidths.thin,
            borderColor: tone,
            backgroundColor: colors.profile.satellite,
            alignItems: 'center',
            justifyContent: 'center',
          },
          ripple: {
            position: 'absolute',
            width: dot,
            height: dot,
            borderRadius: radii.full,
            borderWidth: borderWidths.md,
            borderColor:
              step.state === 'rejected'
                ? colors.profile.orbitRejected
                : colors.text.onBrand,
          },
          points: {
            position: 'absolute',
            top: (hit - dot) / 2 + POINTS_OFFSET_TOP * k,
            end: (hit - dot) / 2 + POINTS_OFFSET_END * k,
            borderRadius: radii.full,
            paddingHorizontal: spacing.xs,
            backgroundColor:
              step.state === 'rejected'
                ? colors.profile.orbitRejected
                : colors.profile.orbitDone,
          },
        };
      },
      [angle, colors, dot, k, size, step.state, tone],
    );

    const press = useCallback(() => {
      if (target) onPress(target);
    }, [onPress, target]);

    const label = t(step.meta.titleKey);

    return (
      <Animated.View
        style={styles.slot}
        entering={
          reduceMotion
            ? undefined
            : ZoomIn.delay(
                SATELLITE_DELAY + order * motion.stagger * 2,
              ).springify()
        }
      >
        <Pressable
          onPress={press}
          disabled={!target}
          scaleOnPress
          align="center"
          justify="center"
          width="100%"
          height="100%"
          accessibilityRole="button"
          accessibilityLabel={
            step.state === 'todo'
              ? `${label}, ${t('account.profile.points', {
                  count: step.points,
                })}`
              : label
          }
        >
          {pulses ? (
            <Animated.View
              style={[styles.ripple, rippleStyle]}
              pointerEvents="none"
            />
          ) : null}
          <Box style={styles.dot}>
            <Icon
              size={sizes.icon.sm * k}
              color={
                step.state === 'review'
                  ? colors.profile.orbitPending
                  : colors.text.onBrand
              }
            />
          </Box>
          {step.state === 'review' ? null : (
            <Box style={styles.points} pointerEvents="none">
              <Text
                variant="caption"
                color={
                  step.state === 'rejected'
                    ? colors.text.onAccent
                    : colors.profile.percentText
                }
              >
                {`+${formatNumber(step.points)}`}
              </Text>
            </Box>
          )}
        </Pressable>
      </Animated.View>
    );
  },
);

interface FaceProps {
  hero: Hero;
  size: number;
  onPress: () => void;
}

/** Photo (logo for a brand, rounded square) in the ring's centre; tapping it changes the photo. */
const Face = memo<FaceProps>(({ hero, size, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const k = size / VIEW;
  const face = FACE * k;
  const badge = BADGE * k;
  const hasPhoto = Boolean(hero.avatarUrl);

  const styles = useStyles(
    ({ radii, shadows }): Record<'slot' | 'face' | 'badge', ViewStyle> => ({
      // Positioned here, not on the Pressable: with `scaleOnPress` its `style` lands on the inner view.
      slot: {
        position: 'absolute',
        top: (size - face) / 2,
        start: (size - face) / 2,
        width: face,
        height: face,
        borderRadius: hero.isBrand ? radii.xl : face / 2,
        ...shadows.md,
      },
      face: {
        width: '100%',
        height: '100%',
        borderRadius: hero.isBrand ? radii.xl : face / 2,
        borderWidth: FACE_RIM * k,
        borderStyle: hasPhoto ? 'solid' : 'dashed',
        borderColor: hasPhoto
          ? colors.profile.faceRim
          : colors.profile.satelliteBorder,
        backgroundColor: hasPhoto ? undefined : colors.profile.satellite,
        alignItems: 'center',
        justifyContent: 'center',
      },
      badge: {
        position: 'absolute',
        bottom: BADGE_INSET * k,
        start: BADGE_INSET * k,
        width: badge,
        height: badge,
        borderRadius: badge / 2,
        borderWidth: FACE_RIM * k,
        borderColor: colors.brand.main,
        backgroundColor: hero.isVerified
          ? colors.profile.orbitVerified
          : colors.profile.percentFill,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [badge, colors, face, hasPhoto, hero.isBrand, hero.isVerified, k, size],
  );

  const inner = face - FACE_RIM * k * 2;
  const label = t(
    hero.isBrand ? 'account.profile.changeLogo' : 'account.profile.changePhoto',
  );

  return (
    <Box style={styles.slot}>
      <Pressable
        style={styles.face}
        width="100%"
        height="100%"
        onPress={onPress}
        disabled={hero.isUploadingAvatar}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {hasPhoto && hero.avatarUrl ? (
          <Image
            uri={hero.avatarUrl}
            size={inner}
            borderRadius={hero.isBrand ? 'lg' : 'full'}
          />
        ) : hero.isUploadingAvatar ? (
          <ActivityIndicator color={colors.text.onBrand} />
        ) : (
          <Box align="center" gap="xs" px="sm">
            <Camera size={sizes.icon.md * k} color={colors.text.onBrand} />
            <Text
              variant="caption"
              color={colors.text.onBrand}
              align="center"
              numberOfLines={2}
            >
              {t(
                hero.isBrand
                  ? 'account.profile.addLogo'
                  : 'account.profile.addPhoto',
              )}
            </Text>
          </Box>
        )}
        {hasPhoto ? (
          <Box style={styles.badge} pointerEvents="none">
            {hero.isUploadingAvatar ? (
              <ActivityIndicator
                size="small"
                color={colors.profile.percentText}
              />
            ) : hero.isVerified ? (
              <BadgeCheck
                size={sizes.icon.xs * k}
                color={colors.profile.percentText}
              />
            ) : (
              <Camera
                size={sizes.icon.xs * k}
                color={colors.profile.percentText}
              />
            )}
          </Box>
        ) : null}
      </Pressable>
    </Box>
  );
});

export interface ProfileOrbitProps {
  hero: Hero;
  compact: boolean;
  onChangePhoto: () => void;
  onStepPress: (target: ProfileStepTarget) => void;
}

/**
 * The profile's signature: one ring around the photo, one arc per completion step. Done arcs
 * glow teal; missing ones stay a faint track, the KYC slot shows its review (blue) or rejection
 * (red) dashed. The three most valuable missing steps sit on their arcs as satellites, the
 * percentage on the ring's foot. Complete → a single ring, gold once verified. Only one ring
 * ever: the whole thing draws in once and then stays still.
 */
const ProfileOrbitComponent: React.FC<ProfileOrbitProps> = ({
  hero,
  compact,
  onChangePhoto,
  onStepPress,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const size = compact ? ORBIT_SIZE_COMPACT : ORBIT_SIZE;
  const k = size / VIEW;
  const { arcs, satellites } = hero.orbit;
  const showArcs = !hero.isComplete && arcs.length > 0;
  const soloLook: ArcLook = hero.isVerified
    ? 'verified'
    : hero.isComplete
    ? 'done'
    : 'missing';

  const reveal = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    // Mount only: a refresh that changes the arcs keeps the drawn ring, no replay.
    reveal.value = withTiming(1, {
      duration: motion.duration.draw,
      easing: Easing.out(Easing.cubic),
    });
  }, [reduceMotion, reveal]);

  const paths = useMemo(
    () => buildArcPaths(showArcs ? arcs.length : 1, size, isRTL),
    [arcs.length, isRTL, showArcs, size],
  );

  const styles = useStyles(
    ({ radii }): Record<'orbit' | 'percentRow' | 'percent', ViewStyle> => ({
      orbit: { width: size, height: size, alignSelf: 'center' },
      percentRow: {
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: PERCENT_DROP * k,
        alignItems: 'center',
      },
      percent: {
        height: PERCENT_H * k,
        paddingHorizontal: PERCENT_PAD * k,
        borderRadius: radii.full,
        justifyContent: 'center',
        backgroundColor: colors.profile.percentFill,
      },
    }),
    [colors.profile.percentFill, k, size],
  );

  const percent = formatNumber(hero.percentage / 100, { style: 'percent' });

  return (
    <Box style={styles.orbit}>
      <Canvas style={styles.orbit} pointerEvents="none">
        {showArcs ? (
          arcs.map((state, index) => {
            const path = paths[index];
            return path ? (
              <OrbitArc
                key={index}
                path={path}
                state={state}
                color={colors.profile[ARC_STYLE[state].color]}
                index={index}
                count={arcs.length}
                k={k}
                reveal={reveal}
              />
            ) : null;
          })
        ) : paths[0] ? (
          <OrbitArc
            path={paths[0]}
            state={soloLook}
            color={colors.profile[ARC_STYLE[soloLook].color]}
            index={0}
            count={1}
            k={k}
            reveal={reveal}
          />
        ) : null}
      </Canvas>

      <Face hero={hero} size={size} onPress={onChangePhoto} />

      {showArcs
        ? satellites.map((satellite, order) => (
            <Satellite
              key={satellite.step.key}
              satellite={satellite}
              order={order}
              size={size}
              onPress={onStepPress}
            />
          ))
        : null}

      {showArcs ? (
        <Box style={styles.percentRow} pointerEvents="none">
          <Box
            style={styles.percent}
            accessible
            accessibilityLabel={`${t(
              'account.profile.completion',
            )}, ${percent}`}
          >
            <Text variant="buttonSmall" color={colors.profile.percentText}>
              {percent}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export const ProfileOrbit = memo(ProfileOrbitComponent);
