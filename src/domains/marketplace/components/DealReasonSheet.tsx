import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  moderateScale,
  motion,
  opacity,
  useStyles,
  useTheme,
} from '@/core/theme';
import { Box, CustomButton, CustomInput } from '@/shared/ui';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealReasonFormValues } from '../schemas/dealRespondSchema';
import { DealSheetFrame } from './DealSheetFrame';

const ART_HEIGHT = moderateScale(112);
const SLIP = { width: moderateScale(168), height: moderateScale(88) };
const SLIP_LINE = moderateScale(8);
const PULL = { x: moderateScale(28), y: moderateScale(-6), turn: 6 };
const TILT = { back: -4, front: 3 };

export type DealReasonSheetKind = 'withdraw' | 'rejectExtension';

const COPY = {
  withdraw: {
    title: 'marketplace.deals.respond.withdraw.title',
    body: 'marketplace.deals.respond.withdraw.body',
    submit: 'marketplace.deals.respond.withdraw.submit',
  },
  rejectExtension: {
    title: 'marketplace.deals.respond.reject.title',
    body: 'marketplace.deals.respond.reject.body',
    submit: 'marketplace.deals.respond.reject.submit',
  },
} as const;

export interface DealReasonSheetProps {
  kind: DealReasonSheetKind | null;
  onClose: () => void;
  creatorName: string;
  control: Control<DealReasonFormValues>;
  onSubmit: () => void;
  submitting: boolean;
}

/** An offer slip being drawn back off a fainter one (still under reduced motion). */
const PulledSlip = memo(() => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pull = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    pull.value = withRepeat(
      withTiming(1, {
        duration: motion.duration.draw * 2,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(pull);
  }, [pull, reduceMotion]);
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pull.value * PULL.x },
      { translateY: pull.value * PULL.y },
      { rotate: `${TILT.front + pull.value * PULL.turn}deg` },
    ],
  }));
  const styles = useStyles(
    ({
      radii,
      spacing,
      borderWidths,
      shadows,
    }): Record<'art' | 'slip' | 'back' | 'line', ViewStyle> => {
      const slip: ViewStyle = {
        position: 'absolute',
        width: SLIP.width,
        height: SLIP.height,
        borderRadius: radii.md,
        padding: spacing.lg,
        gap: spacing.sm,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
        ...shadows.card,
      };
      return {
        art: {
          height: ART_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
        },
        slip,
        back: {
          ...slip,
          opacity: opacity.disabled,
          transform: [{ rotate: `${TILT.back}deg` }],
        },
        line: {
          height: SLIP_LINE,
          borderRadius: radii.full,
          backgroundColor: colors.surface.elevated,
        },
      };
    },
    [colors.border.default, colors.surface.elevated, colors.surface.main],
  );
  return (
    <Box style={styles.art} pointerEvents="none" accessible={false}>
      <Box style={styles.back} />
      <Animated.View style={[styles.slip, frontStyle]}>
        <Box style={styles.line} />
        <Box style={styles.line} />
        <Box style={styles.line} />
      </Animated.View>
    </Box>
  );
});

/**
 * Closing an unfunded offer from the brand side: withdrawing it, or declining the creator's
 * extension (which cancels it). Nothing is charged; the reason is optional and reaches the creator.
 */
const DealReasonSheetComponent: React.FC<DealReasonSheetProps> = ({
  kind,
  onClose,
  creatorName,
  control,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  const styles = useStyles(
    (): Record<'half', ViewStyle> => ({ half: { flex: 1 } }),
    [],
  );
  // Keep the copy while the sheet slides away after `kind` drops to null.
  const shown = useRef<DealReasonSheetKind>(kind ?? 'withdraw');
  if (kind) shown.current = kind;
  const copy = COPY[shown.current];
  return (
    <DealSheetFrame
      visible={kind !== null}
      onClose={onClose}
      title={t(copy.title)}
      body={t(copy.body, { name: creatorName })}
      footer={
        <Box row gap="sm">
          <CustomButton
            title={t('marketplace.deals.respond.reason.cancel')}
            variant="secondary"
            size="lg"
            style={styles.half}
            onPress={onClose}
          />
          <CustomButton
            title={t(copy.submit)}
            variant="danger"
            size="lg"
            loading={submitting}
            style={styles.half}
            onPress={onSubmit}
          />
        </Box>
      }
    >
      <PulledSlip />
      <Controller
        control={control}
        name="reason"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.respond.reason.label')}
            placeholder={t('marketplace.deals.respond.reason.placeholder', {
              name: creatorName,
            })}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RESPOND_LIMITS.maxNoteLength}
            error={fieldState.error?.message}
          />
        )}
      />
    </DealSheetFrame>
  );
};

export const DealReasonSheet = memo(DealReasonSheetComponent);
