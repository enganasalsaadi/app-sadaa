import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import {
  Bell,
  Bookmark,
  CalendarDays,
  Globe,
  Heart,
  Link,
  MessageCircle,
  MousePointer2,
  Music2,
  Play,
  Send,
  Share2,
  Star,
  ThumbsUp,
  Ticket,
  type LucideIcon,
} from 'lucide-react-native';
import { iconStroke, moderateScale, motion, opacity, useStyles, useTheme } from '@/core/theme';
import type { SocialPlatform } from '@/shared/utils';

export type ServiceDecorKey = SocialPlatform | 'inPerson';

interface Glyph {
  icon: LucideIcon;
  end: number;
  top: number;
  size: number;
  /** Resting tilt in degrees. */
  rotate: number;
  /** Leg length as a share of `motion.loop.decorDrift`, so neighbours never move in step. */
  pace: number;
  /** Late start as a share of one leg. */
  phase: number;
}

const glyph = (icon: LucideIcon, end: number, top: number, size: number, rotate: number, pace: number, phase: number): Glyph => ({
  icon,
  end: moderateScale(end),
  top: moderateScale(top),
  size: moderateScale(size),
  rotate,
  pace,
  phase,
});

// Three or four glyphs that say "this platform" at a glance, fading toward the card's middle.
const DECOR = {
  instagram: [
    glyph(Heart, 18, 8, 18, -12, 0.9, 0),
    glyph(MessageCircle, 58, 34, 14, 8, 1.05, 0.4),
    glyph(Send, 96, 10, 13, 14, 1.12, 0.2),
    glyph(Bookmark, 128, 38, 12, -8, 0.95, 0.7),
  ],
  tiktok: [glyph(Music2, 20, 10, 18, -10, 1, 0), glyph(Heart, 62, 36, 13, 10, 0.9, 0.35), glyph(Play, 102, 12, 12, 0, 1.12, 0.15)],
  facebook: [glyph(ThumbsUp, 18, 10, 18, -10, 1, 0), glyph(MessageCircle, 62, 36, 13, 8, 0.92, 0.4), glyph(Share2, 102, 12, 12, 10, 1.1, 0.2)],
  youtube: [glyph(Play, 18, 10, 18, -8, 1, 0), glyph(ThumbsUp, 62, 36, 13, 10, 0.92, 0.4), glyph(Bell, 102, 12, 12, -10, 1.1, 0.2)],
  telegram: [glyph(Send, 18, 10, 18, -12, 1, 0), glyph(MessageCircle, 62, 36, 13, 8, 0.92, 0.4), glyph(Bell, 102, 12, 12, 10, 1.1, 0.2)],
  website: [glyph(Globe, 18, 10, 18, -8, 1, 0), glyph(Link, 62, 36, 13, 10, 0.92, 0.4), glyph(MousePointer2, 102, 12, 12, -10, 1.1, 0.2)],
  inPerson: [glyph(Ticket, 18, 10, 18, -14, 1, 0), glyph(CalendarDays, 64, 36, 13, 6, 0.92, 0.4), glyph(Star, 104, 12, 12, 12, 1.12, 0.2)],
} as const satisfies Record<ServiceDecorKey, readonly Glyph[]>;

const FIELD_WIDTH = moderateScale(150);
const FIELD_HEIGHT = moderateScale(68);
const DRIFT = moderateScale(3.5);
/** Extra tilt at the far end of a leg, degrees. */
const SWAY = 8;

interface DecorGlyphProps {
  glyph: Glyph;
  /** Odd glyphs drift the other way so the field breathes instead of sliding. */
  flip: boolean;
  moving: boolean;
  color: string;
}

const DecorGlyph = memo<DecorGlyphProps>(({ glyph: g, flip, moving, color }) => {
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!moving) {
      cancelAnimation(drift);
      drift.value = withTiming(0, { duration: motion.duration.slow });
      return undefined;
    }
    const leg = motion.loop.decorDrift * g.pace;
    drift.value = withDelay(
      leg * g.phase,
      withRepeat(withTiming(1, { duration: leg, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(drift);
  }, [drift, g, moving]);

  const position = useStyles(
    (): Record<'glyph', ViewStyle> => ({ glyph: { position: 'absolute', top: g.top, end: g.end } }),
    [g],
  );
  const driftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift.value * (flip ? DRIFT : -DRIFT) },
      { translateY: drift.value * (flip ? DRIFT : -DRIFT) },
      { rotate: `${g.rotate + drift.value * SWAY}deg` },
    ],
  }));

  const Icon = g.icon;
  return (
    <Animated.View style={[position.glyph, driftStyle]}>
      <Icon size={g.size} color={color} strokeWidth={iconStroke.thin} />
    </Animated.View>
  );
});

export interface ServiceCardDecorProps {
  kind: ServiceDecorKey;
  /** Picked card: glyphs brighten a touch and drift. */
  active: boolean;
}

/**
 * Faint platform glyphs behind the card head's end corner: a little life on a long list of
 * prices. Purely decorative (hidden from screen readers). Only picked cards drift, only while
 * the step is focused; reduced motion keeps them still.
 */
const ServiceCardDecorComponent: React.FC<ServiceCardDecorProps> = ({ kind, active }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const moving = active && focused && !reduceMotion;
  const glow = useSharedValue(active ? opacity.decorActive : opacity.decor);

  useEffect(() => {
    glow.value = withTiming(active ? opacity.decorActive : opacity.decor, { duration: motion.duration.base });
  }, [active, glow]);

  const styles = useStyles(
    (): Record<'field', ViewStyle> => ({
      field: { position: 'absolute', top: 0, end: 0, width: FIELD_WIDTH, height: FIELD_HEIGHT, pointerEvents: 'none' },
    }),
    [],
  );
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View
      style={[styles.field, glowStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {DECOR[kind].map((g, index) => (
        <DecorGlyph key={index} glyph={g} flip={index % 2 === 1} moving={moving} color={colors.interactive.main} />
      ))}
    </Animated.View>
  );
};

export const ServiceCardDecor = memo(ServiceCardDecorComponent);
