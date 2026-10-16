import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Edge } from 'react-native-safe-area-context';
import { Radio } from 'lucide-react-native';
import { moderateScale } from '@/core/theme';
import { Box, ConfirmSheet, EmptyState, ErrorState, Layout, Skeleton, StaggerIn } from '@/shared/ui';
import { DEAL_UPLOAD_LIMIT } from '../../constants/dealUploads';
import { LiveLinkField } from './components/LiveLinkField';
import { DealProofShots } from '../../components/DealProofShots';
import { PublishDock } from './components/PublishDock';
import { PublishFixTicket } from './components/PublishFixTicket';
import { PublishHero } from './components/PublishHero';
import { PublishOnAir } from './components/PublishOnAir';
import { useDealPublishScreen } from './hooks/useDealPublishScreen';
import { useProofFrames } from '../../hooks/useProofFrames';

const ON_AIR_EDGES: Edge[] = ['left', 'right'];
const SKELETON = { bar: moderateScale(62), shot: moderateScale(180) };

const PublishSkeleton = memo(() => (
  <Box px="xl" pt="lg" gap="lg">
    <Skeleton width="100%" height={SKELETON.bar} borderRadius="lg" />
    <Box row gap="md">
      <Skeleton width="30%" height={SKELETON.shot} borderRadius="lg" />
      <Skeleton width="30%" height={SKELETON.shot} borderRadius="lg" />
      <Skeleton width="30%" height={SKELETON.shot} borderRadius="lg" />
    </Box>
  </Box>
));

/**
 * Creator hands in a deliverable's live post (P7.1, approved «على الهواء»): the «ON AIR» lamp over
 * the brand's fix note (if any), the link as an address bar, the screenshots as phone screens, and
 * the hand-in bar. A handed-in post shows its broadcast ring until verified.
 */
const DealPublishScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useDealPublishScreen();
  const frames = useProofFrames(vm.uploads.entries);
  const { deal, item } = vm;

  if (vm.isLoading) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <PublishSkeleton />
      </Layout>
    );
  }
  if (!deal || !item) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.publish.creator.loadFailed')} />
      </Layout>
    );
  }
  if (vm.onAir) {
    return (
      <Layout
        mode="static"
        padding="none"
        statusBar="light"
        header={{ title: item.title, variant: 'brand' }}
        // No bottom edge: the gradient runs under the home indicator; the on-air footer adds the inset once.
        edges={ON_AIR_EDGES}
      >
        <PublishOnAir {...vm.onAir} onOpenLink={vm.onOpenLink} onBack={vm.goBack} />
      </Layout>
    );
  }
  if (!vm.composing) {
    return (
      <Layout mode="static" header={{ title: item.title }}>
        <EmptyState icon={Radio} title={t('marketplace.deals.publish.creator.early')} />
      </Layout>
    );
  }

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBackdrop="brandGlow"
        header={{ title: item.title, subtitle: vm.brand, variant: 'brand' }}
        footerBehavior="docked"
        footer={
          <PublishDock
            due={vm.due}
            state={vm.submitState}
            progress={vm.progress}
            resubmit={vm.ask !== null}
            submitting={vm.isSubmitting}
            onSubmit={vm.onSubmit}
          />
        }
        hero={
          <PublishHero
            position={vm.position}
            itemTitle={item.title}
            lampOn={vm.lampOn}
            title={vm.hero.title}
            body={vm.hero.body}
          />
        }
      >
        <Box px="xl" pt="2xl" pb="2xl">
          <StaggerIn gap="xl">
            {vm.ask && vm.fixes ? <PublishFixTicket brand={vm.brand} ask={vm.ask} fixes={vm.fixes} /> : null}
            <LiveLinkField control={vm.control} platform={vm.platform} onPaste={vm.onPaste} />
            <DealProofShots
              title={t('marketplace.deals.publish.creator.proofs.title')}
              hint={t('marketplace.deals.publish.creator.proofs.hint')}
              frames={frames}
              max={DEAL_UPLOAD_LIMIT.proof}
              error={vm.proofsError}
              onAdd={vm.pick}
              onRemove={vm.uploads.remove}
              onRetry={vm.uploads.retry}
            />
          </StaggerIn>
        </Box>
      </Layout>
      <ConfirmSheet
        visible={vm.guard.visible}
        onClose={vm.guard.stay}
        title={t('marketplace.deals.publish.creator.discard.title')}
        body={t('marketplace.deals.publish.creator.discard.body')}
        confirmLabel={t('marketplace.deals.publish.creator.discard.confirm')}
        confirmVariant="danger"
        onConfirm={vm.guard.discard}
        cancelLabel={t('marketplace.deals.publish.creator.discard.stay')}
      />
    </>
  );
};

export const DealPublishScreen = memo(DealPublishScreenComponent);
