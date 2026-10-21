import React, { memo, useCallback } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Pressable, StatusPill, Text } from '@/shared/ui';
import type { ChipGroupItem } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import { parcelCanShip, type CampaignParcel, type CampaignShippingFormValues } from '../../../utils/campaignShipping';
import { ParcelAddress } from './ParcelAddress';
import { ParcelForm } from './ParcelForm';
import { ParcelHint } from './ParcelHint';
import { ParcelNotice } from './ParcelNotice';
import { ParcelSent } from './ParcelSent';
import { ParcelTick } from './ParcelTick';

export interface ShippingParcelProps {
  parcel: CampaignParcel;
  control: Control<CampaignShippingFormValues>;
  courierItems: readonly ChipGroupItem[];
  /** The address is shown (the screen hides every address when the app leaves the foreground). */
  revealed: boolean;
  /** One stable handler for every parcel. */
  onToggle: (dealId: string) => void;
  onToggleReveal: (dealId: string) => void;
  onCopyAddress: (dealId: string) => void;
}

/**
 * One parcel on the manifest. Tick it and its waybill opens under it; a failed one shows the
 * server's words above its fields; a locked one says why and when it opens; a sent one is stamped
 * and frozen. The ticks and fields live in the form, so a keystroke re-renders this parcel only.
 */
const ShippingParcelComponent: React.FC<ShippingParcelProps> = ({
  parcel,
  control,
  courierItems,
  revealed,
  onToggle,
  onToggleReveal,
  onCopyAddress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { row, state } = parcel;
  const canShip = parcelCanShip(parcel);
  const selected = useWatch({ control, name: `rows.${row.dealId}.selected` }) === true && canShip;
  const toggle = useCallback(() => onToggle(row.dealId), [onToggle, row.dealId]);

  const name = row.name ?? t('marketplace.campaign.shipping.parcel.unnamed');
  const sent = state === 'sent';
  const Chevron = selected ? ChevronUp : ChevronDown;

  return (
    <Box
      borderRadius="lg"
      shadow={sent || state === 'locked' ? 'none' : 'card'}
      bg={sent ? colors.status.success.soft : colors.surface.main}
      borderWidth={selected || state === 'failed' ? 'md' : state === 'locked' ? 'thin' : 'none'}
      borderColor={
        state === 'failed'
          ? colors.status.danger.main
          : selected
            ? colors.interactive.main
            : colors.border.default
      }
    >
      <Pressable
        row
        align="center"
        gap="md"
        p="md"
        disabled={!canShip}
        onPress={toggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled: !canShip }}
        accessibilityLabel={
          canShip
            ? t(selected ? 'marketplace.campaign.shipping.parcel.deselect' : 'marketplace.campaign.shipping.parcel.select', { name })
            : state === 'locked'
              ? t('marketplace.campaign.shipping.parcel.lockedA11y', { name })
              : name
        }
      >
        <ParcelTick state={state} selected={selected} />
        <DealFace party={{ name: row.name, avatarUrl: row.avatarUrl }} size={sizes.avatar.md} />
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
            {name}
          </Text>
          <Box row wrap gap="xs">
            {state === 'ready' ? (
              <StatusPill label={t('marketplace.campaign.shipping.parcel.ready')} tone="success" size="sm" />
            ) : state === 'failed' ? (
              <StatusPill label={t('marketplace.campaign.shipping.parcel.failed')} tone="danger" size="sm" />
            ) : state === 'locked' ? (
              <StatusPill label={t('marketplace.campaign.shipping.parcel.locked')} tone="warning" size="sm" />
            ) : null}
            {parcel.reship && !sent ? (
              <StatusPill
                label={t('marketplace.campaign.shipping.parcel.reship', { remaining: formatNumber(row.reshipmentsLeft) })}
                tone="info"
                size="sm"
              />
            ) : null}
          </Box>
        </Box>
        {canShip ? <Chevron size={sizes.icon.sm} color={colors.text.tertiary} /> : null}
      </Pressable>

      {canShip && row.address ? (
        <ParcelAddress
          dealId={row.dealId}
          name={name}
          address={row.address}
          revealed={revealed}
          onToggle={onToggleReveal}
          onCopy={onCopyAddress}
        />
      ) : null}
      {parcel.failure ? <ParcelNotice kind="failed" message={parcel.failure.message} /> : null}
      {state === 'locked' && parcel.opensAt !== null ? <ParcelNotice kind="brief" opensAt={parcel.opensAt} /> : null}
      {state === 'locked' && parcel.opensAt === null && row.blockers.includes('brief_window') ? (
        <ParcelNotice kind="brief" opensAt={null} />
      ) : null}
      {state === 'locked' && parcel.addressMissing ? <ParcelNotice kind="address" /> : null}
      {canShip && selected ? <ParcelForm dealId={row.dealId} control={control} courierItems={courierItems} /> : null}
      {canShip && !selected ? <ParcelHint dealId={row.dealId} control={control} courierItems={courierItems} /> : null}
      {parcel.sent ? <ParcelSent sent={parcel.sent} /> : null}
    </Box>
  );
};

export const ShippingParcel = memo(ShippingParcelComponent);
