import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import { DealShippingStamp } from '../../../components/DealShippingStamp';
import type { CampaignShippingSent } from '../../../utils/campaignShipping';

export interface ParcelSentProps {
  sent: CampaignShippingSent;
}

/** A parcel that left in this visit: the stamp lands once, then the courier and number it went with. */
const ParcelSentComponent: React.FC<ParcelSentProps> = ({ sent }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reshipped = sent.row.kind === 'reship';
  return (
    <Box row align="center" gap="md" px="md" pb="md">
      <DealShippingStamp
        label={t(
          reshipped
            ? 'marketplace.campaign.shipping.parcel.stampReshipped'
            : 'marketplace.campaign.shipping.parcel.stampSent',
        )}
        tone="success"
      />
      <Box row align="center" gap="xs" flex={1}>
        <Truck size={sizes.icon.xs} color={colors.status.success.text} />
        <Text variant="caption" color={colors.status.success.text} numberOfLines={1}>
          {`${sent.courier} · ${isolateLtr(sent.trackingNo)}`}
        </Text>
      </Box>
    </Box>
  );
};

export const ParcelSent = memo(ParcelSentComponent);
