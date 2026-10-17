import React, { memo } from 'react';
import { Box, StaggerIn } from '@/shared/ui';
import { useCampaignReviewSummary } from '../hooks/useCampaignReviewSummary';
import { LockedBriefPreview } from './LockedBriefPreview';
import { PrivateBriefSheet } from './PrivateBriefSheet';
import { ReviewNoteCard } from './ReviewNoteCard';
import { ReviewNotices } from './ReviewNotices';
import { ReviewSummaryCard } from './ReviewSummaryCard';
import { SubmitBlockSheet } from './SubmitBlockSheet';

/**
 * Step 4: the campaign on one card (each part a tap from its step), the private brief locked the
 * way creators meet it, then what stands between the brand and sending. The dock sends.
 */
const ReviewStepComponent: React.FC = () => {
  const { rows, openRow, ready, briefLines, shortfall, reviewNote } = useCampaignReviewSummary();

  return (
    <>
      <Box gap="lg" pb="3xl">
        {reviewNote ? <ReviewNoteCard note={reviewNote} /> : null}
        <StaggerIn gap="lg">
          <ReviewSummaryCard rows={rows} onOpen={openRow} />
          {briefLines.length > 0 ? <LockedBriefPreview lines={briefLines} onOpen={openRow} /> : null}
          <ReviewNotices ready={ready} shortfall={shortfall} />
        </StaggerIn>
      </Box>
      <PrivateBriefSheet />
      <SubmitBlockSheet />
    </>
  );
};

export const ReviewStep = memo(ReviewStepComponent);
