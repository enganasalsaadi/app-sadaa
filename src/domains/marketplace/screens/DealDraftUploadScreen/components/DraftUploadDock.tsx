import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';
import { DealRoundBars } from '../../../components/DealRoundBars';
import type { DealRounds } from '../../../utils/dealDrafts';
import type { DraftSubmitState } from '../hooks/useDealDraftUploadScreen';

export interface DraftUploadDockProps {
  rounds: DealRounds;
  state: DraftSubmitState;
  /** 0–1 across every picked file. */
  progress: number;
  done: number;
  total: number;
  submitting: boolean;
  onSubmit: () => void;
}

/**
 * The hand-in bar: how many revision requests the brand still has, over one button. While files
 * go up the button fills with their share and says how far; then it becomes «hand in round n».
 * A plain press: handing in a round binds nothing (approving does, on the brand's side).
 */
const DraftUploadDockComponent: React.FC<DraftUploadDockProps> = ({
  rounds,
  state,
  progress,
  done,
  total,
  submitting,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(progress);
  useEffect(() => {
    fill.value = reduceMotion ? progress : withTiming(progress, { duration: motion.duration.develop });
  }, [fill, progress, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.round(fill.value * 100)}%` }));

  const styles = useStyles(
    ({ radii, sizes, borderWidths }): Record<'tank' | 'fill' | 'remaining', ViewStyle> => ({
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
      remaining: { flex: 1 },
    }),
    [colors.interactive.main, colors.interactive.soft, colors.surface.elevated],
  );

  const waitingLabel =
    state === 'failed'
      ? t('marketplace.deals.drafts.upload.dock.fix')
      : t('marketplace.deals.drafts.upload.dock.waiting', {
          done,
          total,
          percent: `${Math.round(progress * 100)}%`,
        });

  return (
    <Box px="xl" pt="md" pb="md" gap="md">
      <Box row align="center" gap="sm">
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.deals.drafts.upload.dock.rounds')}
        </Text>
        <DealRoundBars rounds={rounds} />
        <Text variant="caption" color={colors.text.tertiary} numberOfLines={1} style={styles.remaining}>
          {t('marketplace.deals.drafts.upload.dock.left', { remaining: rounds.remaining, allowed: rounds.allowed })}
        </Text>
      </Box>
      {state === 'ready' ? (
        <CustomButton
          title={t('marketplace.deals.drafts.upload.dock.submit', { round: rounds.current })}
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
          <Text
            variant="button"
            color={state === 'failed' ? colors.status.danger.text : colors.text.primary}
          >
            {waitingLabel}
          </Text>
        </Pressable>
      )}
    </Box>
  );
};

export const DraftUploadDock = memo(DraftUploadDockComponent);
