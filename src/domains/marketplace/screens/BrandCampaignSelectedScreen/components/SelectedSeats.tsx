import React, { memo, useEffect } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import { APPLICANT_MAX_SEAT_SOCKETS } from '../../../constants/applicants';
import type { SeatFace } from '../../../utils/applicants';

const SOCKET = moderateScale(60);
/** How far below its seat the new face starts: it rises from the bottom of the screen. */
const FLY_FROM = moderateScale(320);
const START_SCALE = 1.6;
const RING_SCALE = 1.9;
const RING_DELAY_MS = 350;

export interface SelectedSeatsProps {
  total: number;
  /** Faces already on their seats, oldest first. */
  taken: readonly SeatFace[];
  newcomer: SeatFace;
  /** Whether the newcomer's seat is held (the face flies in and a ring pulses) or merely reserved. */
  celebrate: boolean;
}

const Newcomer = memo<{ face: SeatFace; celebrate: boolean }>(({ face, celebrate }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const still = reduceMotion || !celebrate;
  const rise = useSharedValue(still ? 0 : FLY_FROM);
  const scale = useSharedValue(still ? 1 : START_SCALE);
  const ring = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    rise.value = withSpring(0, motion.spring);
    scale.value = withSpring(1, motion.spring);
    ring.value = withDelay(RING_DELAY_MS, withTiming(1, { duration: motion.duration.rise, easing: Easing.out(Easing.cubic) }));
    Vibration.vibrate(HAPTIC_TAP_MS);
  }, [ring, rise, scale, still]);
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: rise.value }, { scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - ring.value,
    transform: [{ scale: 1 + (RING_SCALE - 1) * ring.value }],
  }));
  const styles = useStyles(
    ({ borderWidths }): Record<'ring' | 'face', ViewStyle> => ({
      ring: {
        position: 'absolute',
        width: SOCKET,
        height: SOCKET,
        borderRadius: SOCKET / 2,
        borderWidth: borderWidths.lg,
        borderColor: colors.money.main,
      },
      face: { borderWidth: borderWidths.lg, borderColor: colors.money.main, borderRadius: SOCKET / 2, overflow: 'hidden' },
    }),
    [colors.money.main],
  );
  return (
    <Box width={SOCKET} height={SOCKET} align="center" justify="center">
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.face, faceStyle]}>
        <ApplicantFace name={face.name} avatarUrl={face.avatarUrl} size={SOCKET} large />
      </Animated.View>
    </Box>
  );
});

/**
 * The campaign's seats after a pick (PC3.4): the creators already seated, a dashed socket per free
 * seat, and the one just picked, who rises from below into the next seat with a mint ring when the
 * money is held. Past a handful of seats only the newcomer is drawn; the title carries the count.
 */
const SelectedSeatsComponent: React.FC<SelectedSeatsProps> = ({ total, taken, newcomer, celebrate }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'free', ViewStyle> => ({
      free: {
        width: SOCKET,
        height: SOCKET,
        borderRadius: SOCKET / 2,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.button.primary.text,
        opacity: 0.5,
      },
    }),
    [colors.button.primary.text],
  );
  const seated = taken.length + 1;
  const sockets = total <= APPLICANT_MAX_SEAT_SOCKETS ? total : 0;
  const free = Math.max(0, sockets - seated);
  return (
    <Box row align="center" justify="center" gap="md" accessible accessibilityLabel={t('marketplace.campaign.applicants.selected.seatsA11y', { seat: seated, total })}>
      {sockets > 0
        ? taken.slice(0, Math.max(0, sockets - 1)).map(face => (
            <ApplicantFace key={face.id} name={face.name} avatarUrl={face.avatarUrl} size={SOCKET} large />
          ))
        : null}
      <Newcomer face={newcomer} celebrate={celebrate} />
      {Array.from({ length: free }, (_, index) => (
        <Box key={`free-${index}`} style={styles.free} />
      ))}
    </Box>
  );
};

export const SelectedSeats = memo(SelectedSeatsComponent);
