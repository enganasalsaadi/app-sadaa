import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
} from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { iconStroke, motion, resolveHue, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { useReleasedNotice } from '../hooks/useReleasedNotice';
import type { RestrictionNotice } from '../utils/restrictions';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
};

export interface RestrictionBannerProps {
  notice: RestrictionNotice | null;
  onPress: () => void;
}

/** The disc: springs from small when the lock opens, still otherwise. */
const LockDisc = memo<{
  open: boolean;
  ban: boolean;
  tone: ReturnType<typeof resolveHue>;
}>(({ open, ban, tone }) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(1);
  useEffect(() => {
    if (!open || reduceMotion) return;
    pop.value = 0.6;
    pop.value = withSpring(1, motion.spring);
  }, [open, pop, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const Icon = open ? LockOpen : ban ? Ban : Lock;
  return (
    <Animated.View style={style}>
      <Box
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="full"
        align="center"
        justify="center"
        bg={colors.surface.main}
      >
        <Icon
          size={sizes.icon.md}
          color={tone.main}
          strokeWidth={iconStroke.bold}
        />
      </Box>
    </Animated.View>
  );
});

/**
 * The creator's global restriction strip (PC9.0 frames 2–3): amber while a sample's waybill is owed
 * (one tap to the deal), red with the end date while a severe strike bans public applying (one tap to
 * the strikes). When the waybill lifts the lock it turns green for a beat, then folds away. Driven by
 * the server's restriction rows, never guessed.
 */
const RestrictionBannerComponent: React.FC<RestrictionBannerProps> = ({
  notice,
  onPress,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const released = useReleasedNotice(notice);
  const shown = notice ?? released;
  if (!shown) return null;

  const open = notice === null;
  const ban = shown.kind === 'public_apply_ban';
  const hue = resolveHue(colors, open ? 'success' : ban ? 'danger' : 'warning');
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const title = open
    ? t('marketplace.restrictions.unlocked.title')
    : shown.kind === 'return_pending'
    ? t('marketplace.restrictions.returnPending.title')
    : shown.kind === 'public_apply_ban'
    ? shown.endsAt === null
      ? t('marketplace.restrictions.ban.titleOpen')
      : t('marketplace.restrictions.ban.title', {
          date: formatDate(shown.endsAt, DATE_FORMAT, i18n.language),
        })
    : shown.label || t('marketplace.restrictions.other.title');
  const body = open
    ? t('marketplace.restrictions.unlocked.body')
    : shown.kind === 'return_pending'
    ? t('marketplace.restrictions.returnPending.body')
    : shown.kind === 'public_apply_ban'
    ? t('marketplace.restrictions.ban.body')
    : t('marketplace.restrictions.other.body');

  return (
    <Animated.View
      entering={
        reduceMotion ? undefined : FadeInDown.duration(motion.duration.base)
      }
      exiting={
        reduceMotion ? undefined : FadeOutUp.duration(motion.duration.base)
      }
    >
      <Box px="xl" pb="sm">
        <Pressable
          onPress={onPress}
          disabled={open}
          row
          align="center"
          gap="md"
          p="lg"
          borderRadius="lg"
          bg={hue.soft}
          scaleOnPress={!open}
          accessibilityRole={open ? 'text' : 'button'}
          accessibilityLabel={`${title}. ${body}`}
          accessibilityLiveRegion="polite"
        >
          <LockDisc open={open} ban={ban} tone={hue} />
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" color={hue.text}>
              {title}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {body}
            </Text>
          </Box>
          {open ? null : shown.kind === 'return_pending' ? (
            <Box px="md" py="sm" borderRadius="full" bg={colors.surface.main}>
              <Text variant="buttonSmall" color={hue.text}>
                {t('marketplace.restrictions.returnPending.action')}
              </Text>
            </Box>
          ) : (
            <Chevron size={sizes.icon.sm} color={hue.main} />
          )}
        </Pressable>
      </Box>
    </Animated.View>
  );
};

export const RestrictionBanner = memo(RestrictionBannerComponent);
