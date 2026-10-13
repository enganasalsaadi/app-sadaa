import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton } from '@/shared/ui';
import { DraftReviewCard } from '@/domains/marketplace';
import { useDraftReviewDemo } from './hooks/useDraftReviewDemo';
import { MOCK_DRAFT_SUBMITTED_AT, MOCK_IMAGE_URIS } from './mockData';

const VIDEO_SECONDS = 32;

const DraftReviewDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useDraftReviewDemo();
  const changesReview = useMemo(() => demo.changesReview(), [demo]);

  return (
    <Box gap="md">
      <DraftReviewCard
        round={2}
        submittedAt={MOCK_DRAFT_SUBMITTED_AT}
        media={{ uri: MOCK_IMAGE_URIS[1], kind: 'video', durationSeconds: VIDEO_SECONDS }}
        review={demo.review}
        onOpen={demo.onOpen}
        onApprove={demo.canReview ? demo.onApprove : undefined}
        onRequestChanges={demo.canReview ? demo.onRequestChanges : undefined}
        submitting={demo.submitting}
      />
      <DraftReviewCard
        round={1}
        submittedAt={MOCK_DRAFT_SUBMITTED_AT}
        media={{ uri: MOCK_IMAGE_URIS[0], kind: 'image' }}
        review={changesReview}
        onOpen={demo.onOpen}
      />
      <CustomButton title={t('devShowcase.draftReview.reset')} onPress={demo.reset} variant="ghost" size="sm" />
    </Box>
  );
};

export const DraftReviewDemo = memo(DraftReviewDemoComponent);
