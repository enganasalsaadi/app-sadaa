import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PackageCheck, TriangleAlert } from 'lucide-react-native';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealShipment } from '../types';
import { DealShippingStamp } from './DealShippingStamp';

const ICON_BOX = moderateScale(42);
const DAY_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export interface DealShipmentRowProps {
  shipment: DealShipment;
  /** `received`: the receipt the section shrinks to once the product arrived (green stamp). */
  kind: 'received' | 'earlier';
  /** The received line's title: «You received it» / «Sara received it». */
  title?: string;
}

/**
 * One shipment folded to a line. `received`: what the shipping section becomes once the work has
 * started, with the green stamp pressed on it. `earlier`: a re-shipped label under the current
 * one, with what went wrong and how many photos the report had.
 */
const DealShipmentRowComponent: React.FC<DealShipmentRowProps> = ({ shipment, kind, title }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const received = kind === 'received';
  const tone = received ? colors.status.success : colors.status.warning;
  const styles = useStyles(
    ({ radii }): Record<'icon', ViewStyle> => ({
      icon: {
        width: ICON_BOX,
        height: ICON_BOX,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone.soft,
      },
    }),
    [tone.soft],
  );
  const Icon = received ? PackageCheck : TriangleAlert;
  const photos = shipment.issue?.photos.length ?? 0;
  const meta = [
    shipment.courier,
    isolateLtr(shipment.trackingNo),
    received && shipment.receivedAt
      ? formatDate(shipment.receivedAt, DAY_FORMAT, i18n.language)
      : null,
    !received && photos > 0
      ? t('marketplace.deals.shipping.history.photos', { count: photos })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card p="md">
      <Box row align="center" gap="md" accessible>
        <Box style={styles.icon}>
          <Icon size={sizes.icon.sm} color={tone.main} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
            {received
              ? title
              : t('marketplace.deals.shipping.history.title', {
                  number: formatNumber(shipment.sequence, {}, i18n.language),
                  reason: shipment.issue?.reason.label ?? '',
                })}
          </Text>
          <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
            {meta}
          </Text>
        </Box>
        {received ? (
          <DealShippingStamp label={t('marketplace.deals.shipping.receipt.stamp')} tone="success" />
        ) : null}
      </Box>
    </Card>
  );
};

export const DealShipmentRow = memo(DealShipmentRowComponent);
