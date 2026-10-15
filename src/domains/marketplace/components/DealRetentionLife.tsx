import React, { memo, useCallback, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Check, Clapperboard, Clock, Flag } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Pressable,
  SocialPlatformIcon,
  StatusPill,
  Text,
} from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import { DEAL_RETENTION_SPAN } from '../constants/dealRetention';
import type { DealRole } from '../types';
import type { DealRetentionLife as Life } from '../utils/dealRetention';
import { formatRemaining } from '../utils/dealTimer';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = moderateScale(92);
const STROKE = 6;
const RADIUS = (RING - STROKE) / 2;
const LENGTH = 2 * Math.PI * RADIUS;
const CORE = RING - STROKE * 2 - moderateScale(10);
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export interface DealRetentionLifeProps {
  life: Life;
  role: DealRole;
  onReport: (itemId: string) => void;
}

/** The arc of time still to run, drawn once from empty on mount (no loop: time moves by the minute). */
const LifeRing = memo<{ share: number; color: string }>(({ share, color }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const drawn = useSharedValue(reduceMotion ? share : 0);
  useEffect(() => {
    drawn.value = reduceMotion
      ? share
      : withTiming(share, {
          duration: motion.duration.draw,
          easing: Easing.out(Easing.cubic),
        });
  }, [drawn, reduceMotion, share]);
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: LENGTH * (1 - drawn.value),
  }));
  return (
    <Svg width={RING} height={RING}>
      <Circle
        cx={RING / 2}
        cy={RING / 2}
        r={RADIUS}
        stroke={colors.surface.elevated}
        strokeWidth={STROKE}
        fill="none"
      />
      <AnimatedCircle
        cx={RING / 2}
        cy={RING / 2}
        r={RADIUS}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${LENGTH} ${LENGTH}`}
        animatedProps={arcProps}
        transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
      />
    </Svg>
  );
});

/**
 * «عمر المنشور» (approved P9.2): one verified post's agreed time online as a ring that empties
 * slowly beside the post's platform, the time left large. Over, it closes into a full ring with a
 * check. The brand's way to report sits low under it while the server allows a report.
 */
const DealRetentionLifeComponent: React.FC<DealRetentionLifeProps> = ({
  life,
  role,
  onReport,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const brand = role === 'brand';
  const permanent = life.term === 'permanent';
  const span = life.term ? t(DEAL_RETENTION_SPAN[life.term]) : null;
  const report = useCallback(
    () => onReport(life.itemId),
    [life.itemId, onReport],
  );
  const styles = useStyles(
    ({ radii }): Record<'ring' | 'core', ViewStyle> => ({
      ring: {
        width: RING,
        height: RING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      core: {
        position: 'absolute',
        width: CORE,
        height: CORE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: life.running
          ? colors.brand.main
          : colors.status.success.soft,
      },
    }),
    [colors.brand.main, colors.status.success.soft, life.running],
  );

  const pill = !life.running
    ? {
        label: t('marketplace.deals.retention.life.done'),
        tone: 'success' as const,
        icon: Check,
      }
    : life.reported
    ? {
        label: t('marketplace.deals.retention.life.reported'),
        tone: 'warning' as const,
        icon: Flag,
      }
    : {
        label: t('marketplace.deals.retention.life.running'),
        tone: 'interactive' as const,
        icon: Clock,
      };
  const lead = !life.running
    ? life.title
    : permanent
    ? t('marketplace.deals.retention.life.permanent')
    : formatRemaining(t, life.secondsLeft);
  const until = formatDate(life.endsAt, DATE_FORMAT, i18n.language);
  const caption = !life.running
    ? span && !permanent
      ? t('marketplace.deals.retention.life.kept', { span })
      : t('marketplace.deals.retention.life.keptPlain')
    : permanent
    ? brand
      ? t('marketplace.deals.retention.life.permanentBrand', {
          title: life.title,
          date: until,
        })
      : t('marketplace.deals.retention.life.permanentCreator', {
          title: life.title,
        })
    : span
    ? t('marketplace.deals.retention.life.of', { title: life.title, span })
    : t('marketplace.deals.retention.life.until', {
        title: life.title,
        date: until,
      });
  const platform =
    life.platform && isSocialPlatform(life.platform) ? life.platform : null;

  return (
    <Box
      p="lg"
      gap="md"
      bg={colors.surface.main}
      borderRadius="xl"
      shadow="card"
    >
      <Box row align="center" gap="lg">
        <Box
          style={styles.ring}
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('marketplace.deals.retention.life.a11y', {
            state: pill.label,
            remaining: lead,
          })}
        >
          <LifeRing
            share={life.running ? life.share : 1}
            color={
              life.running
                ? colors.interactive.main
                : colors.status.success.main
            }
          />
          <Box style={styles.core}>
            {!life.running ? (
              <Check size={sizes.icon.lg} color={colors.status.success.text} />
            ) : platform ? (
              <SocialPlatformIcon
                platform={platform}
                size={sizes.icon.lg}
                color={colors.text.onBrand}
              />
            ) : (
              <Clapperboard size={sizes.icon.lg} color={colors.text.onBrand} />
            )}
          </Box>
        </Box>
        <Box flex={1} gap="xs" align="flex-start">
          <StatusPill
            label={pill.label}
            tone={pill.tone}
            icon={pill.icon}
            size="sm"
          />
          <Text
            variant={life.running ? 'h3' : 'title'}
            color={colors.text.primary}
            numberOfLines={2}
          >
            {lead}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {caption}
          </Text>
        </Box>
      </Box>
      {life.running ? (
        <Text variant="caption" color={colors.text.tertiary}>
          {brand
            ? t('marketplace.deals.retention.life.brandHint')
            : t('marketplace.deals.retention.life.creatorHint')}
        </Text>
      ) : null}
      {brand && life.reportAvailable ? (
        <Pressable
          onPress={report}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.retention.life.report')}
        >
          <Box align="center" py="sm">
            <Text variant="buttonSmall" color={colors.status.danger.text}>
              {t('marketplace.deals.retention.life.report')}
            </Text>
          </Box>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DealRetentionLife = memo(DealRetentionLifeComponent);
