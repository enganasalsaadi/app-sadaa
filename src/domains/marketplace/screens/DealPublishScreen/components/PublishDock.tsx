import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';

/** The hand-in button: ready, waiting on screenshots, or blocked by one that failed. */
export type PublishSubmitState = 'ready' | 'uploading' | 'failed';

export interface PublishDockProps {
  /** «Publish window: 31 h left»; `null` while there is no clock. */
  due: string | null;
  state: PublishSubmitState;
  /** 0–1 across the picked screenshots. */
  progress: number;
  /** After a fix request the button says «again». */
  resubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}

/**
 * The hand-in bar: the publish window over one button. While screenshots go up the button fills
 * with their share; then it hands the link in. A plain press: the brand's confirmation is the
 * binding step.
 */
const PublishDockComponent: React.FC<PublishDockProps> = ({ due, state, progress, resubmit, submitting, onSubmit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(progress);
  useEffect(() => {
    fill.value = reduceMotion ? progress : withTiming(progress, { duration: motion.duration.develop });
  }, [fill, progress, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.round(fill.value * 100)}%` }));

  const styles = useStyles(
    ({ radii, borderWidths }): Record<'tank' | 'fill', ViewStyle> => ({
      tank: {
        height: sizes.button.lg,
        borderRadius: radii.md,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.elevated,
      },
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        backgroundColor: colors.interactive.soft,
        borderEndWidth: borderWidths.md,
        borderColor: colors.interactive.main,
      },
    }),
    [colors.interactive.main, colors.interactive.soft, colors.surface.elevated, sizes.button.lg],
  );

  const waitingLabel =
    state === 'failed'
      ? t('marketplace.deals.publish.creator.dock.fix')
      : t('marketplace.deals.publish.creator.dock.uploading', { percent: `${Math.round(progress * 100)}%` });

  return (
    <Box px="xl" pt="md" pb="md" gap="md">
      {due ? (
        <Box row align="center" gap="sm">
          <Clock size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {due}
          </Text>
        </Box>
      ) : null}
      {state === 'ready' ? (
        <CustomButton
          title={
            resubmit
              ? t('marketplace.deals.publish.creator.dock.resubmit')
              : t('marketplace.deals.publish.creator.dock.submit')
          }
          size="lg"
          fullWidth
          loading={submitting}
          onPress={onSubmit}
        />
      ) : (
        <Pressable
          style={styles.tank}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel={waitingLabel}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
        >
          {state === 'uploading' ? <Animated.View style={[styles.fill, fillStyle]} /> : null}
          <Text variant="button" color={state === 'failed' ? colors.status.danger.text : colors.text.primary}>
            {waitingLabel}
          </Text>
        </Pressable>
      )}
    </Box>
  );
};

export const PublishDock = memo(PublishDockComponent);
