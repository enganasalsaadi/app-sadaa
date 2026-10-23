import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, Scale, Undo2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  FileViewer,
  Layout,
  Notice,
  Skeleton,
  StaggerIn,
  type ScreenHeaderAction,
} from '@/shared/ui';
import type { DealRole } from '../../types';
import { DisputeDock } from './components/DisputeDock';
import { DisputeEvidenceSheet } from './components/DisputeEvidenceSheet';
import { DisputeRulingCard } from './components/DisputeRulingCard';
import { DisputeScales } from './components/DisputeScales';
import { DisputeStatementCard } from './components/DisputeStatementCard';
import { DisputeThread } from './components/DisputeThread';
import { DisputeWindowCard } from './components/DisputeWindowCard';
import { useDealDisputeScreen } from './hooks/useDealDisputeScreen';

const SKELETON = { scales: moderateScale(220), card: moderateScale(96), entry: moderateScale(120) };

const DisputeSkeleton = memo(() => (
  <Box px="xl" pt="lg" gap="lg">
    <Skeleton width="100%" height={SKELETON.scales} borderRadius="xl" />
    <Skeleton width="100%" height={SKELETON.card} borderRadius="xl" />
    <Skeleton width="86%" height={SKELETON.entry} borderRadius="xl" />
  </Box>
));

export interface DealDisputeScreenProps {
  role: DealRole;
}

/**
 * The dispute file (M9, approved «الميزان»): the scales over the held amount, the evidence window
 * or the team's ruling, the opener's statement, then both sides' evidence on one spine. The dock
 * adds evidence while the window is open; the opener may withdraw.
 */
const DealDisputeScreenComponent: React.FC<DealDisputeScreenProps> = ({ role }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useDealDisputeScreen(role);
  const { dispute, scales } = vm;
  const title = t('marketplace.deals.dispute.file.title');

  if (vm.isLoading) {
    return (
      <Layout mode="static" header={{ title }}>
        <DisputeSkeleton />
      </Layout>
    );
  }
  if (vm.error) {
    return (
      <Layout mode="static" header={{ title }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.dispute.file.loadFailed')} />
      </Layout>
    );
  }
  if (!dispute || !scales) {
    return (
      <Layout mode="static" header={{ title }}>
        <EmptyState icon={Scale} title={t('marketplace.deals.dispute.file.empty')} />
      </Layout>
    );
  }

  const contract: ScreenHeaderAction = {
    icon: FileText,
    accessibilityLabel: t('marketplace.deals.detail.contract'),
    onPress: vm.openContract,
    glass: true,
  };
  const docked = vm.canAdd || vm.evidenceFull || vm.canWithdraw;

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBackdrop="brandGlow"
        heroBehavior="parallax"
        header={{ title, variant: 'brand', actions: [contract] }}
        footerBehavior="docked"
        footer={
          docked ? (
            <DisputeDock
              canAdd={vm.canAdd}
              full={vm.evidenceFull}
              canWithdraw={vm.canWithdraw}
              onAdd={vm.evidence.open}
              onWithdraw={vm.askWithdraw}
            />
          ) : undefined
        }
        hero={<DisputeScales {...scales} lean={vm.lean} />}
        scrollProps={{
          refreshControl: (
            <RefreshControl
              refreshing={vm.isRefreshing}
              onRefresh={vm.onRefresh}
              // The spinner sits over the navy backdrop.
              tintColor={colors.text.onBrand}
            />
          ),
        }}
      >
        <Box px="xl" pt="2xl" pb="5xl">
          <StaggerIn gap="xl">
            {vm.phase === 'evidence' || vm.phase === 'review' ? (
              <DisputeWindowCard
                dueAt={dispute.evidenceOpen ? dispute.evidenceDueAt : null}
                open={dispute.evidenceOpen}
                target={vm.target}
              />
            ) : null}
            {vm.phase === 'ruled' && dispute.ruling ? <DisputeRulingCard ruling={dispute.ruling} role={role} /> : null}
            {vm.phase === 'withdrawn' ? (
              <Notice tone="info" message={t('marketplace.deals.dispute.file.withdrawnNote')} />
            ) : null}
            <DisputeStatementCard dispute={dispute} mine={vm.mineOpened} other={vm.other} />
            <DisputeThread
              entries={vm.thread}
              role={role}
              other={vm.other}
              onOpenMedia={vm.openMedia}
              onLink={vm.onLink}
            />
          </StaggerIn>
        </Box>
      </Layout>
      <FileViewer {...vm.viewer} refreshUrl={vm.refreshUrl} />
      <DisputeEvidenceSheet evidence={vm.evidence} />
      <ConfirmSheet
        visible={vm.withdrawVisible}
        onClose={vm.closeWithdraw}
        onDismissed={vm.onWithdrawDismissed}
        icon={<Undo2 size={sizes.icon.lg} color={colors.text.secondary} />}
        title={t('marketplace.deals.dispute.withdraw.title')}
        body={t('marketplace.deals.dispute.withdraw.body')}
        confirmLabel={t('marketplace.deals.dispute.withdraw.confirm')}
        confirmVariant="danger"
        confirmLoading={vm.withdrawing}
        onConfirm={vm.confirmWithdraw}
        cancelLabel={t('marketplace.deals.dispute.withdraw.cancel')}
      >
        <Notice
          tone="warning"
          message={t('marketplace.deals.dispute.withdraw.left', {
            count: vm.disputesLeft,
            remaining: formatNumber(vm.disputesLeft),
          })}
        />
      </ConfirmSheet>
    </>
  );
};

export const DealDisputeScreen = memo(DealDisputeScreenComponent);
