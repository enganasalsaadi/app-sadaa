import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { Box, ConfirmSheet, ErrorState, Layout, Skeleton, StaggerIn } from '@/shared/ui';
import { DealItemFuse } from '../../components/DealItemFuse';
import { DEAL_DRAFT_LIMITS } from '../../constants/dealDrafts';
import { DraftAskTicket } from './components/DraftAskTicket';
import { DraftCaptionCard } from './components/DraftCaptionCard';
import { DraftContactSheet } from './components/DraftContactSheet';
import { DraftHandedIn } from './components/DraftHandedIn';
import { DraftUploadDock } from './components/DraftUploadDock';
import { useRoundFrames, useUploadFrames } from './hooks/useDraftFrames';
import { useDealDraftUploadScreen } from './hooks/useDealDraftUploadScreen';

const SKELETON = { fuse: moderateScale(32), film: moderateScale(320), caption: moderateScale(180) };

const UploadSkeleton = memo(() => (
  <Box px="xl" pt="lg" gap="lg">
    <Skeleton width="45%" height={SKELETON.fuse} borderRadius="full" />
    <Skeleton width="100%" height={SKELETON.film} borderRadius="xl" />
    <Skeleton width="100%" height={SKELETON.caption} borderRadius="lg" />
  </Box>
));

/**
 * Creator hands in a deliverable's round (P6.1, approved «غرفة التحميض»): the brand's last notes
 * as a ticket, the files on a strip of film that develops as they upload, the caption as the post
 * will show it, and the hand-in bar. A handed-in round shows its seal and stays read only.
 */
const DealDraftUploadScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const vm = useDealDraftUploadScreen();
  const uploadFrames = useUploadFrames(vm.uploads.entries, vm.durations);
  const roundFrames = useRoundFrames(vm.latest?.files);
  const { deal, item, rounds } = vm;

  if (vm.isLoading) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <UploadSkeleton />
      </Layout>
    );
  }
  if (!deal || !item || !rounds) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.drafts.upload.loadFailed')} />
      </Layout>
    );
  }

  return (
    <>
      <Layout
        padding="none"
        header={{
          title: t('marketplace.deals.drafts.upload.title', { round: vm.latest && !vm.composing ? vm.latest.round : rounds.current }),
          subtitle: t('marketplace.deals.drafts.upload.subtitle', { item: item.title, brand: deal.brand.name ?? '' }),
        }}
        footerBehavior="docked"
        footer={
          vm.composing ? (
            <DraftUploadDock
              rounds={rounds}
              state={vm.submitState}
              progress={vm.progress}
              done={vm.doneCount}
              total={vm.uploads.entries.length}
              submitting={vm.isSubmitting}
              onSubmit={vm.onSubmit}
            />
          ) : undefined
        }
      >
        <Box px="xl" pt="lg" pb="2xl">
          <StaggerIn gap="xl">
            {vm.composing ? (
              <Box row justify="flex-end">
                <DealItemFuse dueAt={item.dueAt} paused={item.timerPaused} />
              </Box>
            ) : vm.handedIn ? (
              <DraftHandedIn title={vm.handedIn.title} body={vm.handedIn.body} rounds={rounds} />
            ) : null}
            {vm.composing && vm.ask ? <DraftAskTicket draft={vm.ask} /> : null}
            {vm.composing ? (
              <DraftContactSheet
                frames={uploadFrames}
                max={DEAL_DRAFT_LIMITS.files}
                editable
                canAdd={vm.uploads.remaining > 0}
                moving={vm.moving}
                error={vm.filesError}
                onAdd={vm.pick}
                onLift={vm.lift}
                onDrop={vm.dropAt}
                onRemove={vm.uploads.remove}
                onRetry={vm.uploads.retry}
              />
            ) : roundFrames.length > 0 ? (
              <DraftContactSheet
                frames={roundFrames}
                max={DEAL_DRAFT_LIMITS.files}
                editable={false}
                canAdd={false}
                moving={null}
                error={null}
              />
            ) : null}
            {vm.composing ? (
              <DraftCaptionCard creator={deal.creator} control={vm.control} tokens={vm.tokens} onInsert={vm.insertToken} />
            ) : vm.latest ? (
              <DraftCaptionCard creator={deal.creator} caption={vm.latest.caption} tokens={vm.tokens} />
            ) : null}
          </StaggerIn>
        </Box>
      </Layout>
      <ConfirmSheet
        visible={vm.guard.visible}
        onClose={vm.guard.stay}
        title={t('marketplace.deals.drafts.upload.discard.title')}
        body={t('marketplace.deals.drafts.upload.discard.body')}
        confirmLabel={t('marketplace.deals.drafts.upload.discard.confirm')}
        confirmVariant="danger"
        onConfirm={vm.guard.discard}
        cancelLabel={t('marketplace.deals.drafts.upload.discard.stay')}
      />
    </>
  );
};

export const DealDraftUploadScreen = memo(DealDraftUploadScreenComponent);
