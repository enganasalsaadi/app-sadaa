import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Pause } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import type { DealShippingModel } from '../hooks/useDealShipping';
import type { Deal, DealRole } from '../types';
import { transitDays } from '../utils/dealShipping';
import { DealShipmentIssueCard } from './DealShipmentIssueCard';
import { DealShipmentRow } from './DealShipmentRow';
import { DealShippingAddressCard } from './DealShippingAddressCard';
import { DealTransitMeter } from './DealTransitMeter';
import { DealWaybill } from './DealWaybill';

const WHEN_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
};

export interface DealShippingSectionProps {
  deal: Deal;
  role: DealRole;
  shipping: DealShippingModel;
}

/** A waybill footer line: an icon and one or two lines of text. */
const FootLine = memo<{ icon: typeof Clock; lead: string; body?: string; tone: 'neutral' | 'warning' }>(
  ({ icon: Icon, lead, body, tone }) => {
    const { colors, sizes } = useTheme();
    const warn = tone === 'warning';
    return (
      <Box row gap="sm" align="flex-start" accessible>
        <Icon size={sizes.icon.sm} color={warn ? colors.status.warning.main : colors.interactive.main} />
        <Box flex={1} gap="xs">
          <Text variant="buttonSmall" color={warn ? colors.status.warning.text : colors.text.primary}>
            {lead}
          </Text>
          {body ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {body}
            </Text>
          ) : null}
        </Box>
      </Box>
    );
  },
);

/**
 * The deal page's shipping section (P5, approved 2026-10-15, direction A «the waybill»): the
 * label for the shipment on its way (blank until the brand fills it), the reported problem under
 * it, the delivery address, earlier labels after a re-ship; once received, one stamped receipt line.
 */
const DealShippingSectionComponent: React.FC<DealShippingSectionProps> = ({ deal, role, shipping }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { view, now, party } = shipping;
  if (!view) return null;

  const name = isolateText(party);
  const brand = role === 'brand';

  if (view.phase === 'received' && view.current) {
    return (
      <DealShipmentRow
        shipment={view.current}
        kind="received"
        title={
          brand
            ? t('marketplace.deals.shipping.receipt.brand', { name })
            : t('marketplace.deals.shipping.receipt.creator')
        }
      />
    );
  }

  const address = (
    <DealShippingAddressCard
      address={view.address}
      partyName={party}
      onCopy={brand ? shipping.onCopyAddress : undefined}
      onEdit={view.addressEditable ? shipping.opens.address : undefined}
    />
  );

  const heading = (
    <Box row align="baseline" justify="space-between" gap="md">
      <Text variant="h4" color={colors.text.primary} accessibilityRole="header">
        {brand ? t('marketplace.deals.shipping.title.brand') : t('marketplace.deals.shipping.title.creator')}
      </Text>
      <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
        {deal.shippingMode.label}
      </Text>
    </Box>
  );

  if (view.phase === 'address') {
    return (
      <Box gap="lg">
        {heading}
        {address}
      </Box>
    );
  }

  const { current } = view;
  const previous = view.earlier[0] ?? null;

  const footer = (() => {
    switch (view.phase) {
      case 'toShip': {
        const by = view.shipBy ? formatDate(view.shipBy, WHEN_FORMAT, i18n.language) : null;
        return (
          <FootLine
            icon={Clock}
            tone="neutral"
            lead={
              by
                ? t('marketplace.deals.shipping.toShip.by', { date: by })
                : t('marketplace.deals.shipping.toShip.soon')
            }
            body={
              brand
                ? t('marketplace.deals.shipping.toShip.brandNote', { name })
                : t('marketplace.deals.shipping.toShip.creatorNote', { name })
            }
          />
        );
      }
      case 'inTransit':
        return current ? (
          <DealTransitMeter
            days={transitDays(current, now)}
            hint={
              brand
                ? t('marketplace.deals.shipping.inTransit.brandHint', { name })
                : t('marketplace.deals.shipping.inTransit.creatorHint')
            }
          />
        ) : null;
      case 'issue':
        return (
          <FootLine
            icon={Pause}
            tone="warning"
            lead={t('marketplace.deals.shipping.issue.pausedLead')}
            body={
              brand
                ? t('marketplace.deals.shipping.issue.pausedBrand')
                : t('marketplace.deals.shipping.issue.pausedCreator', { name })
            }
          />
        );
      default:
        return null;
    }
  })();

  // The brand edits the label until receipt or a report (server PUT window).
  const canEdit = brand && view.phase === 'inTransit';

  return (
    <Box gap="lg">
      {heading}
      <DealWaybill
        shipment={current}
        previous={previous}
        role={role}
        brand={deal.brand}
        creator={deal.creator}
        footer={footer}
        onCopy={current ? shipping.onCopyTracking : undefined}
        onTrack={shipping.onTrack}
        onEdit={canEdit ? shipping.opens.edit : undefined}
      />
      {view.phase === 'issue' && current ? (
        <DealShipmentIssueCard
          shipment={current}
          role={role}
          dealId={deal.id}
          partyName={party}
          freeCancel={view.freeCancel}
          reshipsLeft={view.reshipsLeft}
        />
      ) : null}
      {address}
      {view.earlier.map(shipment => (
        <DealShipmentRow key={shipment.id} shipment={shipment} kind="earlier" />
      ))}
    </Box>
  );
};

export const DealShippingSection = memo(DealShippingSectionComponent);
