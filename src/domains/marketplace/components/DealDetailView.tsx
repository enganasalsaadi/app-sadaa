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
import { DealBriefExitCard } from './DealBriefExitCard';
import { DealBriefExitSheet } from './DealBriefExitSheet';
import { DealDetailHero } from './DealDetailHero';
import { DealDetailSkeleton } from './DealDetailSkeleton';
import { DealChangesSection } from './DealChangesSection';
import { DealChangesSheets } from './DealChangesSheets';
import { DealDeliverables } from './DealDeliverables';
import { DealDisputeCard } from './DealDisputeCard';
import { DealDropCard } from './DealDropCard';
import { DealDisputeSheet } from './DealDisputeSheet';
import { DealDossier } from './DealDossier';
import { DealExtensionRequestCard } from './DealExtensionRequestCard';
import { DealFundingCard } from './DealFundingCard';
import { DealNextStepCard } from './DealNextStepCard';
import { DealOutcomeCard } from './DealOutcomeCard';
import { DealRatingSection } from './DealRatingSection';
import { DealRespondDock } from './DealRespondDock';
import { DealReturnAnswerSheets } from './DealReturnAnswerSheets';
import { DealReturnCard } from './DealReturnCard';
import { DealReturnSheet } from './DealReturnSheet';
import { DealRespondSheets } from './DealRespondSheets';
import { DealRetentionCases } from './DealRetentionCases';
import { DealRetentionSection } from './DealRetentionSection';
import { DealRetentionSheets } from './DealRetentionSheets';
import { DealShippingDock } from './DealShippingDock';
import { DealShippingSection } from './DealShippingSection';
import { DealShippingSheets } from './DealShippingSheets';
import { DealStageCard } from './DealStageCard';
import { DealUpsellSection } from './DealUpsellSection';

/**
 * The detail's section slots, in the order a role reads them. Later phases add theirs here with
 * a case in `DetailSection`.
 */
export type DealDetailSectionKey =
  | 'briefExit'
  | 'next'
  | 'drop'
  | 'return'
  | 'dispute'
  | 'retentionCases'
  | 'upsell'
  | 'rating'
  | 'deliverables'
  | 'shipping'
  | 'retention'
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

/** Same test as `DealChangesSection`'s own: anything to show at the bottom of the page. */
const hasChanges = ({ role, upsells, cancel, dispute }: DealDetailModel): boolean =>
  upsells.history.length > 0 ||
  upsells.canPropose ||
  (role === 'brand' ? cancel.canCancel : cancel.canWithdraw) ||
  dispute.canOpen;

const DetailSection = memo<{
  section: DealDetailSectionKey;
  deal: Deal;
  station: DealStationView;
  vm: DealDetailModel;
}>(({ section, deal, station, vm }) => {
  const party = vm.role === 'brand' ? deal.creator : deal.brand;

  // Every empty section returns null here, never from its component: a component that renders
  // nothing still gets the spacing Box below and opens a gap on the page.
  function sectionContent(): React.ReactElement | null {
    switch (section) {
      case 'briefExit':
        return vm.briefExit.available && !vm.stopped ? <DealBriefExitCard exit={vm.briefExit} /> : null;
      case 'drop':
        return vm.drop && !vm.stopped ? <DealDropCard drop={vm.drop} role={vm.role} /> : null;
      // The sample's way back outlives the deal: shown even after it stops.
      case 'return':
        return vm.returns.view ? (
          <DealReturnCard deal={deal} role={vm.role} ret={vm.returns} answer={vm.returnAnswer} />
        ) : null;
      case 'next': {
        // A dispute (open or ruled) is the next step and the outcome: its card says so (P9.1).
        if (vm.dispute.showCard) return null;
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
      case 'dispute':
        return vm.dispute.showCard ? (
          <DealDisputeCard dispute={vm.dispute} role={vm.role} />
        ) : null;
      case 'retentionCases':
        return vm.retention.cases.length > 0 ? (
          <DealRetentionCases retention={vm.retention} />
        ) : null;
      case 'retention':
        return vm.retention.hasLives ? (
          <DealRetentionSection deal={deal} retention={vm.retention} />
        ) : null;
      case 'upsell':
        return vm.stopped || !vm.upsells.pending ? null : (
          <DealUpsellSection deal={deal} role={vm.role} upsells={vm.upsells} />
        );
      case 'changes':
        return vm.stopped || !hasChanges(vm) ? null : (
          <DealChangesSection role={vm.role} upsells={vm.upsells} cancel={vm.cancel} dispute={vm.dispute} />
        );
      case 'rating':
        return vm.rating.view ? (
          <DealRatingSection rating={vm.rating} party={party} />
        ) : null;
      case 'deliverables':
        return vm.deliverables && vm.deliverables.length > 0 ? (
          <DealDeliverables
            items={vm.deliverables}
            role={vm.role}
            onOpen={vm.openItem}
          />
        ) : null;
      case 'shipping':
        return vm.stopped || !vm.shipping.view ? null : (
          <DealShippingSection deal={deal} role={vm.role} shipping={vm.shipping} />
        );
      case 'stage':
        return station.stages[vm.selected] ? (
          <StageSection
            deal={deal}
            vm={vm}
            station={station}
            funding={vm.funding}
            events={vm.events}
          />
        ) : null;
      case 'dossier':
        return <DealDossier deal={deal} role={vm.role} />;
      default: {
        const _exhaustive: never = section;
        return _exhaustive;
      }
    }
  }

  const node = sectionContent();
  if (!node) return null;
  return <Box mb="xl">{node}</Box>;
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
            <DealRespondDock
              deal={deal}
              respond={vm.respond}
              restriction={vm.restrictions.notice}
              onRestriction={vm.restrictions.openNotice}
            />
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
            onOpenCampaign={vm.openCampaign}
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
          <StaggerIn>
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
      <DealDisputeSheet deal={deal} role={vm.role} dispute={vm.dispute} />
      <DealRetentionSheets deal={deal} retention={vm.retention} />
      {vm.role === 'creator' ? <DealBriefExitSheet exit={vm.briefExit} deal={deal} /> : null}
      {vm.role === 'creator' ? <DealReturnSheet deal={deal} ret={vm.returns} /> : null}
      {vm.role === 'brand' ? <DealReturnAnswerSheets deal={deal} ret={vm.returns} answer={vm.returnAnswer} /> : null}
    </>
  );
};

export const DealDetailView = memo(DealDetailViewComponent);
