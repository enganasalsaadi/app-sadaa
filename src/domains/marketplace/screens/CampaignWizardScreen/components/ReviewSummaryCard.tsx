import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';
import type { ReviewRow, ReviewRowKey } from '../hooks/useCampaignReviewSummary';
import { ReviewSummaryRow } from './ReviewSummaryRow';

interface ReviewSummaryCardProps {
  rows: readonly ReviewRow[];
  onOpen: (key: ReviewRowKey) => void;
}

/** The whole campaign on one card, one row per part, each a tap from its step. */
const ReviewSummaryCardComponent: React.FC<ReviewSummaryCardProps> = ({ rows, onOpen }) => {
  const { colors } = useTheme();
  return (
    <Box
      bg={colors.surface.main}
      borderRadius="lg"
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
    >
      {rows.map((row, index) => (
        <ReviewSummaryRow key={row.key} row={row} divided={index > 0} onOpen={onOpen} />
      ))}
    </Box>
  );
};

export const ReviewSummaryCard = memo(ReviewSummaryCardComponent);
