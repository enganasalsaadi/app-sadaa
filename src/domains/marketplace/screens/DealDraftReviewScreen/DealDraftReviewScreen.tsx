import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard } from 'lucide-react-native';
import { moderateScale } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { Box, EmptyState, ErrorState, Layout, Skeleton, StaggerIn } from '@/shared/ui';
import { ReviewBanner } from './components/ReviewBanner';
import { ReviewCaption } from './components/ReviewCaption';
import { ReviewDock } from './components/ReviewDock';
import { ReviewExtraSheet } from './components/ReviewExtraSheet';
import { ReviewHistory } from './components/ReviewHistory';
import { ReviewNotes } from './components/ReviewNotes';
import { ReviewPinSheet } from './components/ReviewPinSheet';
import { ReviewRevisionSheet } from './components/ReviewRevisionSheet';
import { ReviewStage } from './components/ReviewStage';
import { useDealDraftReviewScreen } from './hooks/useDealDraftReviewScreen';

const SKELETON = { stage: moderateScale(320), row: moderateScale(56) };

const ReviewSkeleton = memo(() => (
  <Box px="xl" pt="lg" gap="md">
    <Skeleton width="100%" height={SKELETON.stage} borderRadius="lg" />
    <Skeleton width="100%" height={SKELETON.row} borderRadius="lg" />
    <Skeleton width="100%" height={SKELETON.row} borderRadius="lg" />
  </Box>
));

/**
 * Brand reviews a deliverable's latest round (P6.2, approved «طاولة المونتاج»): the round on a navy
 * stage with its timeline, notes pinned to seconds or files, then press-and-hold to approve or ask
 * for changes (an extra round once they're used up). Earlier rounds stay below as the record.
 */
const DealDraftReviewScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const vm = useDealDraftReviewScreen();
  const { deal, item, rounds, latest, file, mode } = vm;

  if (vm.isLoading) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ReviewSkeleton />
      </Layout>
    );
  }
  if (!deal || !item || !rounds) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.drafts.review.loadFailed')} />
      </Layout>
    );
  }
  if (!latest || !file) {
    return (
      <Layout mode="static" header={{ title: item.title }}>
        <EmptyState icon={Clapperboard} title={t('marketplace.deals.drafts.review.noDraft')} />
      </Layout>
    );
  }

  const reviewing = mode === 'review';
  const creatorName = deal.creator.name ?? '';
  const pinFile = vm.pinTarget ? vm.files.findIndex(entry => entry.id === vm.pinTarget?.fileId) : -1;
  const pinKind = vm.files[pinFile]?.kind === 'video' ? 'video' : 'image';
  const title = t('marketplace.deals.drafts.review.title', { name: creatorName, round: latest.round });

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBackdrop="brand"
        header={{
          title,
          subtitle: item.title,
          variant: 'brand',
        }}
        footerBehavior="docked"
        footer={
          mode === 'review' || mode === 'approveAsIs' ? (
            <ReviewDock
              rounds={rounds}
              round={latest.round}
              mode={mode === 'review' ? 'review' : 'asIs'}
              notes={vm.pins.length}
              approving={vm.isApproving}
              onApprove={vm.onApprove}
              onRevise={vm.openRevision}
            />
          ) : undefined
        }
        hero={
          <ReviewStage
            title={title}
            item={item}
            draft={latest}
            files={vm.files}
            file={file}
            fileIndex={vm.fileIndex}
            pins={vm.pins}
            reviewing={reviewing}
            onSelect={vm.selectFile}
            onPinAt={vm.pinAt}
            onPinWhole={vm.pinWhole}
          />
        }
      >
        <Box px="xl" pt="2xl" pb="2xl">
          <StaggerIn gap="xl">
            {mode === 'approveAsIs' ? (
              <ReviewBanner
                kind="asIs"
                title={t('marketplace.deals.drafts.review.asIs.title')}
                body={t('marketplace.deals.drafts.review.asIs.body', { round: latest.round })}
              />
            ) : mode === 'view' ? (
              item.status.key === 'revision_requested' ? (
                <ReviewBanner
                  kind="waiting"
                  title={item.status.label}
                  body={t('marketplace.deals.drafts.review.waiting', { round: latest.round + 1 })}
                />
              ) : (
                <ReviewBanner kind="decided" title={item.status.label} />
              )
            ) : null}
            <ReviewCaption caption={latest.caption} />
            {reviewing ? <ReviewNotes pins={vm.pins} files={vm.files} onRemove={vm.removePin} /> : null}
            <ReviewHistory drafts={vm.history} />
          </StaggerIn>
        </Box>
      </Layout>
      <ReviewPinSheet
        visible={vm.sheet === 'pin'}
        onClose={vm.closeSheet}
        file={pinFile + 1}
        kind={pinKind}
        atSecond={vm.pinTarget?.atSecond ?? null}
        control={vm.pinControl}
        onAdd={vm.addPin}
      />
      <ReviewRevisionSheet
        visible={vm.sheet === 'revision'}
        onClose={vm.closeSheet}
        round={latest.round}
        rounds={rounds}
        files={vm.files}
        pins={vm.pins}
        onRemovePin={vm.removePin}
        control={vm.revisionControl}
        submitting={vm.isRevising}
        onSubmit={vm.onRevision}
      />
      <ReviewExtraSheet
        visible={vm.sheet === 'extra'}
        onClose={vm.closeSheet}
        creatorName={creatorName}
        itemTitle={item.title}
        extra={vm.extra}
        canTopUp={vm.canTopUp}
        onTopUp={vm.onTopUp}
        sending={vm.isRequestingExtra}
        onRequest={vm.onRequestExtra}
      />
    </>
  );
};

export const DealDraftReviewScreen = memo(DealDraftReviewScreenComponent);
