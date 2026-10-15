import React, { memo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { BottomSheet, Box, Text } from '@/shared/ui';
import type { DealRatingModel } from '../hooks/useDealRating';
import type { DealParty } from '../types';
import { DealFace } from './DealFace';
import { DealRatingQuestion } from './DealRatingQuestion';
import { DealRatingSealed } from './DealRatingSealed';
import { DealRatingSkipConfirm } from './DealRatingSkipConfirm';
import { DealRatingSummary } from './DealRatingSummary';

/** The summary with its note still fits small phones with the keyboard up. */
const MAX_HEIGHT_RATIO = 0.92;
const FACE = moderateScale(44);

export interface DealRatingSheetProps {
  rating: DealRatingModel;
  party: DealParty;
  now: number;
}

/**
 * The rating sheet (approved 2026-10-15, «الختم»): it hugs what it shows, so the deal stays in
 * sight above it. The other side's face and «private until both open» over a deck of question
 * cards, then the summary, then the seal pressed onto your envelope. Skip asks first, in place.
 */
const DealRatingSheetComponent: React.FC<DealRatingSheetProps> = ({
  rating,
  party,
  now,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { height } = useWindowDimensions();
  const name = party.name ?? '';
  const { phase, criteria, step } = rating;
  const criterion = criteria[step];
  const asking = phase === 'question' || phase === 'summary';

  const body = (() => {
    switch (phase) {
      case 'question':
        return criterion ? (
          <DealRatingQuestion
            criterion={criterion}
            index={step}
            total={criteria.length}
            value={rating.scores[criterion]}
            onPick={rating.pick}
            onBack={step > 0 ? rating.back : null}
            onSkip={rating.askSkip}
          />
        ) : null;
      case 'summary':
        return (
          <DealRatingSummary
            criteria={criteria}
            scores={rating.scores}
            control={rating.control}
            name={name}
            isSubmitting={rating.isSubmitting}
            onEdit={rating.edit}
            onSeal={rating.submit}
            onBack={rating.back}
            onSkip={rating.askSkip}
          />
        );
      case 'skip':
        return (
          <DealRatingSkipConfirm
            name={name}
            isSkipping={rating.isSkipping}
            onBack={rating.cancelSkip}
            onConfirm={rating.confirmSkip}
          />
        );
      case 'sealed':
        return rating.seal ? (
          <DealRatingSealed
            name={name}
            seal={rating.seal}
            dueAt={rating.view?.dueAt ?? null}
            now={now}
            onDone={rating.close}
          />
        ) : null;
      default: {
        const _exhaustive: never = phase;
        return _exhaustive;
      }
    }
  })();

  return (
    <BottomSheet
      visible={rating.visible}
      onClose={rating.close}
      maxHeight={height * MAX_HEIGHT_RATIO}
      bg={colors.layout.base}
      muted
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box px="xl" pt="xs" pb="xl" gap="lg">
          {asking ? (
            <Box row align="center" gap="md">
              <DealFace party={party} size={FACE} />
              <Box flex={1} gap="xs">
                <Text
                  variant="h4"
                  color={colors.text.primary}
                  accessibilityRole="header"
                  numberOfLines={2}
                >
                  {t('marketplace.deals.rating.sheet.title', { name })}
                </Text>
                <Box row align="center" gap="xs">
                  <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
                  <Text variant="caption" color={colors.text.tertiary}>
                    {t('marketplace.deals.rating.sheet.private')}
                  </Text>
                </Box>
              </Box>
            </Box>
          ) : null}
          {body}
        </Box>
      </ScrollView>
    </BottomSheet>
  );
};

export const DealRatingSheet = memo(DealRatingSheetComponent);
