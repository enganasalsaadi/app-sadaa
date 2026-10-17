import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react-native';
import { useWatch, type Control } from 'react-hook-form';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import {
  CAMPAIGN_SHIPMENT_CHUNK,
  parcelCanShip,
  type CampaignParcel,
  type CampaignShippingFormValues,
} from '../../../utils/campaignShipping';

export interface ShippingDockProps {
  control: Control<CampaignShippingFormValues>;
  parcels: readonly CampaignParcel[];
  /** Resolves when every chunk has been answered; the hold frees itself either way. */
  onSend: () => Promise<void>;
}

/**
 * The docked bar of the manifest: press and hold to ship the ticked parcels (binding, so never a
 * tap). When only failed parcels are ticked it offers to send those again. Watches the ticks alone.
 */
const ShippingDockComponent: React.FC<ShippingDockProps> = ({ control, parcels, onSend }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const rows = useWatch({ control, name: 'rows' });
  const shippable = parcels.filter(parcelCanShip);
  if (shippable.length === 0) return null;

  const picked = shippable.filter(parcel => rows?.[parcel.row.dealId]?.selected);
  const total = formatNumber(picked.length);
  const retry = picked.length > 0 && picked.every(parcel => parcel.state === 'failed');
  const chunks = Math.ceil(picked.length / CAMPAIGN_SHIPMENT_CHUNK);
  const label = t(retry ? 'marketplace.campaign.shipping.dock.retry' : 'marketplace.campaign.shipping.dock.hold', { total });

  return (
    <Box px="xl" py="sm" gap="sm">
      {picked.length === 0 ? (
        <Text variant="bodySmall" color={colors.text.tertiary} align="center">
          {t('marketplace.campaign.shipping.toast.pickOne')}
        </Text>
      ) : (
        <DealHoldToSign
          label={label}
          caption={
            chunks > 1
              ? t('marketplace.campaign.shipping.dock.captionChunks', { chunks: formatNumber(chunks) })
              : t('marketplace.campaign.shipping.dock.caption')
          }
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={label}
          accessibilityHint={t('marketplace.campaign.shipping.dock.holdA11y')}
          sendingLabel={t('marketplace.campaign.shipping.dock.sending')}
          icon={Truck}
          onComplete={onSend}
        />
      )}
    </Box>
  );
};

export const ShippingDock = memo(ShippingDockComponent);
