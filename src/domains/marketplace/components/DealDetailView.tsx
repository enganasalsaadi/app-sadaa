import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookOpenText, FileText } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ErrorState,
  Layout,
  StaggerIn,
  type ScreenHeaderAction,
} from '@/shared/ui';
import { useDealStationCopy } from '../hooks/useDealStationCopy';
import type { DealDetailModel } from '../hooks/useDealDetail';
import type { Deal, DealFunding } from '../types';
import type { DealStationView } from '../utils/dealStation';
import type { DealStationEvents } from '../utils/dealTimelineEvents';
import { DealDetailHero } from './DealDetailHero';
import { DealDetailSkeleton } from './DealDetailSkeleton';
import { DealChangesSection } from './DealChangesSection';
import { DealChangesSheets } from './DealChangesSheets';
import { DealDeliverables } from './DealDeliverables';
import { DealDossier } from './DealDossier';
import { DealExtensionRequestCard } from './DealExtensionRequestCard';
import { DealFundingCard } from './DealFundingCard';
import { DealNextStepCard } from './DealNextStepCard';
import { DealOutcomeCard } from './DealOutcomeCard';
import { DealRatingSection } from './DealRatingSection';
import { DealRespondDock } from './DealRespondDock';
import { DealRespondSheets } from './DealRespondSheets';
import { DealShippingDock } from './DealShippingDock';
import { DealShippingSection } from './DealShippingSection';
import { DealShippingSheets } from './DealShippingSheets';
import { DealStageCard } from './DealStageCard';
import { DealUpsellSection } from './DealUpsellSection';

/**
 * The detail's section slots, in the order a role reads them. Later phases add theirs here
 * (dispute P9) with a case in `DetailSection`.
 */
export type DealDetailSectionKey =
  | 'next'
  | 'upsell'
  | 'rating'
  | 'deliverables'
  | 'shipping'
  | 'dossier'
  | 'stage'
  | 'changes';

export interface DealDetailViewProps {
  vm: DealDetailModel;
  sections: readonly DealDetailSectionKey[];
}

interface StageSectionProps {
  deal: Deal;
  vm: DealDetailModel;
  station: DealStationView;
  funding: DealFunding | null;
  events: DealStationEvents;
}

const StageSection = memo<StageSectionProps>(
  ({ deal, vm, station, funding, events }) => {
    const copy = useDealStationCopy(deal, vm.role, funding);
    const stage = station.stages[vm.selected];
    if (!stage) return null;
    return (
      <DealStageCard
        stages={station.stages}
        state={station.state}
        selected={vm.selected}
        onSelect={vm.select}
        copy={copy[stage.key]}
        events={events[stage.key]}
      />
    );
  },
);

const DetailSection = memo<{
  section: DealDetailSectionKey;
  deal: Deal;
  station: DealStationView;
  vm: DealDetailModel;
}>(({ section, deal, station, vm }) => {
  const party = vm.role === 'brand' ? deal.creator : deal.brand;
  switch (section) {
    case 'next': {
      if (vm.stopped) return <DealOutcomeCard deal={deal} />;
      // While the product ships, the waybill is the next step (P5).
      if (vm.shipping.view && vm.shipping.view.phase !== 'received' && vm.shipping.view.phase !== 'address') {
        return null;
      }
      const { respond } = vm;
      // While the brand decides, the decision itself is the next step (P4).
      if (respond.dock === 'brandExtension' && respond.ask) {
        return (
          <DealExtensionRequestCard creator={deal.creator} ask={respond.ask} />
        );
      }
      if (respond.dock === 'brandFunding') {
        return (
          <DealFundingCard
            funding={respond.funding}
            state={respond.fundingState}
            total={deal.total}
            dueAt={deal.dueAt}
            canTopUp={respond.canTopUp}
          />
        );
      }
      // The rating section carries its own invite (P10).
      return vm.next && vm.next.key !== 'rate' ? (
        <DealNextStepCard
          step={vm.next}
          name={party.name ?? ''}
          action={vm.focusItem?.action ?? null}
          itemId={vm.focusItem?.itemId ?? null}
          onAction={vm.openItem}
        />
      ) : null;
    }
    case 'upsell':
      return vm.stopped ? null : (
        <DealUpsellSection deal={deal} role={vm.role} upsells={vm.upsells} />
      );
    case 'changes':
      return vm.stopped ? null : (
        <DealChangesSection role={vm.role} upsells={vm.upsells} cancel={vm.cancel} />
      );
    case 'rating':
      return <DealRatingSection rating={vm.rating} party={party} />;
    case 'deliverables':
      return vm.deliverables ? (
        <DealDeliverables
          items={vm.deliverables}
          role={vm.role}
          onOpen={vm.openItem}
        />
      ) : null;
    case 'shipping':
      return vm.stopped ? null : (
        <DealShippingSection deal={deal} role={vm.role} shipping={vm.shipping} />
      );
    case 'stage':
      return (
        <StageSection
          deal={deal}
          vm={vm}
          station={station}
          funding={vm.funding}
          events={vm.events}
        />
      );
    case 'dossier':
      return <DealDossier deal={deal} role={vm.role} />;
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
});

/**
 * Deal detail, shared by both roles' screens (approved 2026-10-14): the navy orbit hero the body
 * slides over (same hero behaviour as Wallet and Profile; the overlay header pins the name once
 * it scrolls away), then the role's sections. While the deal waits on the viewer's answer or money
 * (P4), or on the product's shipping (P5), the decision bar is pinned below and its sheets open
 * over the page.
 */
const DealDetailViewComponent: React.FC<DealDetailViewProps> = ({
  vm,
  sections,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { deal, station } = vm;

  if (vm.isLoading) return <DealDetailSkeleton />;
  if (!deal || !station) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState
          error={vm.error}
          onRetry={vm.onRetry}
          title={t('marketplace.deals.detail.loadFailed')}
        />
      </Layout>
    );
  }

  const party = vm.role === 'brand' ? deal.creator : deal.brand;
  const guide: ScreenHeaderAction = {
    icon: BookOpenText,
    accessibilityLabel: t('marketplace.deals.detail.guide'),
    onPress: vm.openGuide,
    glass: true,
  };
  const contract: ScreenHeaderAction = {
    icon: FileText,
    accessibilityLabel: t('marketplace.deals.detail.contract'),
    onPress: vm.openContract,
    glass: true,
  };
  const actions = vm.hasContract
    ? ([contract, guide] as const)
    : ([guide] as const);

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBackdrop="brandGlow"
        heroBehavior="parallax"
        header={{ title: party.name ?? '', variant: 'brand', actions }}
        footerBehavior="docked"
        footer={
          vm.respond.dock ? (
            <DealRespondDock deal={deal} respond={vm.respond} />
          ) : vm.shipping.dock ? (
            <DealShippingDock shipping={vm.shipping} />
          ) : undefined
        }
        hero={
          <DealDetailHero
            deal={deal}
            role={vm.role}
            station={station}
            selected={vm.selected}
            onSelect={vm.select}
          />
        }
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
          <StaggerIn gap="2xl">
            {sections.map(section => (
              <DetailSection
                key={section}
                section={section}
                deal={deal}
                station={station}
                vm={vm}
              />
            ))}
          </StaggerIn>
        </Box>
      </Layout>
      <DealRespondSheets
        deal={deal}
        respond={vm.respond}
        hasContract={vm.hasContract}
      />
      <DealShippingSheets deal={deal} shipping={vm.shipping} />
      <DealChangesSheets
        deal={deal}
        role={vm.role}
        cancel={vm.cancel}
        upsells={vm.upsells}
      />
    </>
  );
};

export const DealDetailView = memo(DealDetailViewComponent);
