import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks } from 'lucide-react-native';
import { useWatch, type Control } from 'react-hook-form';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Chip, Rail, Text } from '@/shared/ui';
import { parcelCanShip, type CampaignParcel, type CampaignShippingFormValues } from '../../../utils/campaignShipping';

const SELECT_ALL = 'select-all';

export interface ShippingBulkBarProps {
  control: Control<CampaignShippingFormValues>;
  parcels: readonly CampaignParcel[];
  courierItems: readonly { value: string; label: string }[];
  onSelectAll: (selected: boolean) => void;
  onCourier: (value: string) => void;
}

/**
 * The shortcuts of a big batch: tick every parcel that can ship, and one courier for all of them
 * (most batches go through one company; the number stays per parcel). It watches the ticks alone,
 * so a keystroke in a row never re-renders the list.
 */
const ShippingBulkBarComponent: React.FC<ShippingBulkBarProps> = ({
  control,
  parcels,
  courierItems,
  onSelectAll,
  onCourier,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const rows = useWatch({ control, name: 'rows' });
  const shippable = parcels.filter(parcelCanShip);
  const picked = shippable.filter(parcel => rows?.[parcel.row.dealId]?.selected).length;
  const all = shippable.length > 0 && picked === shippable.length;

  const handle = useCallback(
    (value: string) => {
      if (value === SELECT_ALL) onSelectAll(!all);
      else onCourier(value);
    },
    [all, onCourier, onSelectAll],
  );

  if (shippable.length === 0) return null;
  return (
    <Box gap="sm">
      <Rail bleed gap="sm" gutter="xl">
        <Chip
          value={SELECT_ALL}
          icon={ListChecks}
          label={all ? t('marketplace.campaign.shipping.bulk.clearReady') : t('marketplace.campaign.shipping.bulk.selectReady', { total: formatNumber(shippable.length) })}
          selected={all}
          onSelect={handle}
        />
      </Rail>
      <Box gap="xs">
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.campaign.shipping.bulk.label')}
        </Text>
        <Rail bleed gap="sm" gutter="xl">
          {courierItems.map(item => (
            <Chip key={item.value} value={item.value} label={item.label} onSelect={handle} />
          ))}
        </Rail>
      </Box>
    </Box>
  );
};

export const ShippingBulkBar = memo(ShippingBulkBarComponent);
