import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, RatingMark, RatingStars, SectionHeader } from '@/shared/ui';
import { useRatingStarsDemo } from './hooks/useRatingStarsDemo';

const REVIEW_COUNT = 128;

const RatingStarsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { rating, setRating } = useRatingStarsDemo();

  return (
    <Box gap="lg">
      <Box gap="sm">
        <RatingStars value={4.3} count={REVIEW_COUNT} />
        <RatingStars value={3.5} size="md" />
        <RatingStars value={4.8} showValue={false} />
        <RatingStars value={0} count={0} />
      </Box>
      <Box row align="center" gap="md" wrap>
        <RatingMark value={4.7} count={12} pill />
        <RatingMark value={4.6} count={9} />
        <Box p="sm" borderRadius="md" bg={colors.brand.main}>
          <RatingMark value={4.9} count={31} surface="onBrand" />
          <RatingStars value={3.5} count={REVIEW_COUNT} surface="onBrand" />
        </Box>
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.ratingStars.inputTitle')} />
        <RatingStars value={rating} onChange={setRating} />
      </Box>
    </Box>
  );
};

export const RatingStarsDemo = memo(RatingStarsDemoComponent);
