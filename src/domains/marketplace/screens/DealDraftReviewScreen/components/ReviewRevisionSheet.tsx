import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Text, SheetFrame } from '@/shared/ui';
import { DEAL_DRAFT_LIMITS } from '../../../constants/dealDrafts';
import type { DealRevisionFormValues } from '../../../schemas/dealDraftSchema';
import type { DealFile } from '../../../types';
import type { DealRounds } from '../../../utils/dealDrafts';
import type { ReviewPin } from '../hooks/useDealDraftReviewScreen';
import { ReviewNotes } from './ReviewNotes';

const COIN = moderateScale(40);

export interface ReviewRevisionSheetProps {
  visible: boolean;
  onClose: () => void;
  round: number;
  rounds: DealRounds;
  files: DealFile[];
  pins: ReviewPin[];
  onRemovePin: (key: string) => void;
  control: Control<DealRevisionFormValues>;
  submitting: boolean;
  onSubmit: () => void;
}

/**
 * Asking for changes: the overall note (required), the pinned notes riding along (removable),
 * and the round it costs, drawn as a coin (the last one says what comes after).
 */
const ReviewRevisionSheetComponent: React.FC<ReviewRevisionSheetProps> = ({
  visible,
  onClose,
  round,
  rounds,
  files,
  pins,
  onRemovePin,
  control,
  submitting,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const last = rounds.remaining <= 1;
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'cost' | 'coin' | 'costText', ViewStyle> => ({
      cost: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.interactive.soft,
      },
      coin: {
        width: COIN,
        height: COIN,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.interactive.main,
      },
      costText: { flex: 1 },
    }),
    [colors.interactive.main, colors.interactive.soft, colors.surface.main],
  );
  return (
    <SheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.drafts.review.revision.title', { round })}
      body={t('marketplace.deals.drafts.review.revision.body')}
      footer={
        <CustomButton
          title={t('marketplace.deals.drafts.review.revision.send')}
          size="lg"
          fullWidth
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <Controller
        control={control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.drafts.review.revision.label')}
            placeholder={t('marketplace.deals.drafts.review.revision.placeholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            showCount
            maxLength={DEAL_DRAFT_LIMITS.revisionNote}
            error={fieldState.error?.message}
          />
        )}
      />
      {pins.length > 0 ? <ReviewNotes pins={pins} files={files} onRemove={onRemovePin} /> : null}
      <Box style={styles.cost}>
        <Box style={styles.coin}>
          <Text variant="label" color={colors.interactive.text}>
            {String(rounds.remaining)}
          </Text>
        </Box>
        <Text variant="bodySmall" color={colors.interactive.text} style={styles.costText}>
          {last
            ? t('marketplace.deals.drafts.review.revision.costLast')
            : t('marketplace.deals.drafts.review.revision.cost', {
                remaining: rounds.remaining,
                allowed: rounds.allowed,
              })}
        </Text>
      </Box>
    </SheetFrame>
  );
};

export const ReviewRevisionSheet = memo(ReviewRevisionSheetComponent);
