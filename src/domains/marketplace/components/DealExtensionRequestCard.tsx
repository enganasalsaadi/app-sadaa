import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import type { DealParty } from '../types';
import { monogramOf } from '../utils/creatorText';
import type { DealExtensionAsk } from '../utils/dealRespond';
import { formatDuration } from '../utils/offerDuration';
import { DealStripes } from './DealStripes';

const AVATAR = moderateScale(40);
const BAR = moderateScale(44);
const STRIPE = 8;

export interface DealExtensionRequestCardProps {
  creator: DealParty;
  ask: DealExtensionAsk;
}

/**
 * The creator's ask, as the brand weighs it: the offer's time as a solid block and the added
 * days stretching out of it in stripes (grows in once), the new total in words, and the creator's
 * reason quoted. The answer lives in the decision bar below.
 */
const DealExtensionRequestCardComponent: React.FC<
  DealExtensionRequestCardProps
> = ({ creator, ask }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const added = ask.toHours - ask.fromHours;
  const grow = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    grow.value = withDelay(
      motion.duration.slow,
      withTiming(1, {
        duration: motion.duration.draw,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [grow, reduceMotion]);
  const addStyle = useAnimatedStyle(() => ({ flexGrow: added * grow.value }));

  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<
      'card' | 'avatar' | 'bar' | 'from' | 'add' | 'quote',
      ViewStyle
    > => ({
      card: {
        padding: spacing.lg,
        gap: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: colors.brand.soft,
        borderWidth: borderWidths.md,
        borderColor: colors.interactive.main,
      },
      bar: {
        height: BAR,
        flexDirection: 'row',
        borderRadius: radii.md,
        overflow: 'hidden',
      },
      from: {
        flexGrow: ask.fromHours,
        flexBasis: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.soft,
      },
      add: {
        flexBasis: 0,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: colors.interactive.main,
      },
      quote: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.surface.elevated,
      },
    }),
    [
      ask.fromHours,
      colors.border.card,
      colors.brand.soft,
      colors.interactive.main,
      colors.surface.elevated,
      colors.surface.main,
    ],
  );

  const name = creator.name ?? '';
  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md">
        <Box style={styles.avatar}>
          {creator.avatarUrl ? (
            <Image
              source={{ uri: creator.avatarUrl }}
              width={AVATAR}
              height={AVATAR}
            />
          ) : (
            <Text variant="buttonSmall" color={colors.brand.text}>
              {monogramOf(name)}
            </Text>
          )}
        </Box>
        <Box flex={1}>
          <Text variant="overline" color={colors.interactive.text}>
            {t('marketplace.deals.respond.request.overline')}
          </Text>
          <Text
            variant="caption"
            color={colors.text.tertiary}
            numberOfLines={1}
          >
            {t('marketplace.deals.respond.request.who')}
          </Text>
        </Box>
      </Box>
      <Text variant="h4" color={colors.text.primary}>
        {t('marketplace.deals.respond.request.title', {
          to: formatDuration(t, ask.toHours),
          from: formatDuration(t, ask.fromHours),
        })}
      </Text>
      <Box gap="xs">
        <Box style={styles.bar} accessible={false}>
          <Box style={styles.from}>
            <Text
              variant="buttonSmall"
              color={colors.brand.text}
              numberOfLines={1}
            >
              {formatDuration(t, ask.fromHours)}
            </Text>
          </Box>
          <Animated.View style={[styles.add, addStyle]}>
            <DealStripes color={colors.interactive.text} stripe={STRIPE} />
            <Text
              variant="buttonSmall"
              color={colors.text.onAccent}
              numberOfLines={1}
            >
              {t('marketplace.deals.respond.request.added', {
                duration: formatDuration(t, added),
              })}
            </Text>
          </Animated.View>
        </Box>
        <Box row justify="space-between">
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.respond.request.from')}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.respond.request.to', {
              duration: formatDuration(t, ask.toHours),
            })}
          </Text>
        </Box>
      </Box>
      {ask.reason ? (
        <Box style={styles.quote}>
          <Quote size={sizes.icon.sm} color={colors.interactive.main} />
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.primary}>
              {ask.reason}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export const DealExtensionRequestCard = memo(DealExtensionRequestCardComponent);
