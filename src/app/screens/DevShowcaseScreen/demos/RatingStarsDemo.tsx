import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, RatingStars, SectionHeader } from '@/shared/ui';
import { useRatingStarsDemo } from './hooks/useRatingStarsDemo';

const REVIEW_COUNT = 128;

const RatingStarsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { rating, setRating } = useRatingStarsDemo();

  return (
    <Box gap="lg">
      <Box gap="sm">
        <RatingStars value={4.3} count={REVIEW_COUNT} />
        <RatingStars value={3.5} size="md" />
        <RatingStars value={4.8} showValue={false} />
        <RatingStars value={0} count={0} />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.ratingStars.inputTitle')} />
        <RatingStars value={rating} onChange={setRating} />
      </Box>
    </Box>
  );
};

export const RatingStarsDemo = memo(RatingStarsDemoComponent);
