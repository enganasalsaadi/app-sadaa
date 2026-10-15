import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Lock, Stamp } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Pressable, Text } from '@/shared/ui';
import {
  DEAL_RATING_CRITERION_COPY,
  DEAL_RATING_LIMITS,
} from '../constants/dealRating';
import type { DealRatingFormValues } from '../schemas/dealRatingSchema';
import type { DealRatingCriterion } from '../types';
import type { DealRatingScores } from '../utils/dealRating';

export interface DealRatingSummaryProps {
  criteria: readonly DealRatingCriterion[];
  scores: DealRatingScores;
  control: Control<DealRatingFormValues>;
  name: string;
  isSubmitting: boolean;
  onEdit: (index: number) => void;
  onSeal: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const ScoreTile = memo<{
  index: number;
  criterion: DealRatingCriterion;
  score: number | undefined;
  onEdit: (index: number) => void;
}>(({ index, criterion, score, onEdit }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const title = t(DEAL_RATING_CRITERION_COPY[criterion].title);
  const edit = useCallback(() => onEdit(index), [index, onEdit]);
  const styles = useStyles(
    ({ radii, spacing }): Record<'tile', ViewStyle> => ({
      tile: {
        flex: 1,
        borderRadius: radii.lg,
        backgroundColor: colors.layout.base,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        gap: spacing.xs,
      },
    }),
    [colors.layout.base],
  );
  return (
    <Pressable
      style={styles.tile}
      onPress={edit}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.rating.sheet.editA11y', {
        criterion: title,
        score: score ?? 0,
      })}
    >
      <Text variant="h3" color={colors.interactive.text}>
        {score === undefined ? '' : formatNumber(score)}
      </Text>
      <Text
        variant="caption"
        color={colors.text.tertiary}
        align="center"
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
});

/**
 * The rating's last card: the three scores (a tap goes back to that question), an optional note,
 * and «seal». Sealing is a plain press: a rating binds no money, so no hold.
 */
const DealRatingSummaryComponent: React.FC<DealRatingSummaryProps> = ({
  criteria,
  scores,
  control,
  name,
  isSubmitting,
  onEdit,
  onSeal,
  onBack,
  onSkip,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'flip', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        padding: spacing.lg,
        gap: spacing.md,
        ...shadows.lg,
      },
      flip: { transform: [{ scaleX: isRTL ? -1 : 1 }] },
    }),
    [colors.surface.main, isRTL],
  );
  return (
    <Animated.View
      entering={FadeInDown.springify()
        .damping(motion.spring.damping)
        .stiffness(motion.spring.stiffness)}
    >
      <Box style={styles.card}>
        <Box row align="center" justify="space-between">
          <Text variant="overline" color={colors.interactive.text}>
            {t('marketplace.deals.rating.sheet.summary')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.rating.sheet.summaryHint')}
          </Text>
        </Box>
        <Box row gap="sm">
          {criteria.map((criterion, index) => (
            <ScoreTile
              key={criterion}
              index={index}
              criterion={criterion}
              score={scores[criterion]}
              onEdit={onEdit}
            />
          ))}
        </Box>
        <Controller
          control={control}
          name="comment"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('marketplace.deals.rating.sheet.commentLabel')}
              placeholder={t('marketplace.deals.rating.sheet.commentPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              showCount
              maxLength={DEAL_RATING_LIMITS.maxCommentLength}
              error={fieldState.error?.message}
            />
          )}
        />
      </Box>
      <Box mt="lg" gap="sm">
        <CustomButton
          title={t('marketplace.deals.rating.sheet.seal')}
          onPress={onSeal}
          loading={isSubmitting}
          fullWidth
          leftIcon={<Stamp size={sizes.icon.sm} />}
        />
        <Box row align="center" justify="center" gap="xs">
          <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.rating.sheet.privacy', { name })}
          </Text>
        </Box>
      </Box>
      <Box row align="center" justify="space-between" mt="sm">
        <Pressable
          row
          align="center"
          gap="xs"
          py="md"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.rating.sheet.back')}
        >
          <Box style={styles.flip}>
            <ChevronLeft size={sizes.icon.sm} color={colors.interactive.text} />
          </Box>
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.deals.rating.sheet.back')}
          </Text>
        </Pressable>
        <Pressable
          py="md"
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.rating.sheet.skip')}
        >
          <Text variant="buttonSmall" color={colors.text.tertiary}>
            {t('marketplace.deals.rating.sheet.skip')}
          </Text>
        </Pressable>
      </Box>
    </Animated.View>
  );
};

export const DealRatingSummary = memo(DealRatingSummaryComponent);
