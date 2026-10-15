import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Divider,
  KeyValueRow,
  MoneyText,
  type KeyValueRowProps,
} from '@/shared/ui';
import type { Deal, DealRole } from '../types';
import { formatDuration } from '../utils/offerDuration';

const SENT_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

export interface DealDossierLogisticsProps {
  deal: Deal;
  role: DealRole;
}

/** Deal type (with or without a product), how long the work takes, when it was sent, and (brand) the total. */
const DealDossierLogisticsComponent: React.FC<DealDossierLogisticsProps> = ({
  deal,
  role,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [colors.border.card, colors.surface.main],
  );
  const hours =
    deal.deliveryHours ??
    (deal.requestedDeliveryDays !== null
      ? deal.requestedDeliveryDays * 24
      : null);
  const withProduct =
    deal.shippingMode.key !== null && deal.shippingMode.key !== 'none';

  const rows: (KeyValueRowProps & { key: string })[] = [
    {
      key: 'mode',
      label: t('marketplace.deals.dossier.mode'),
      value: deal.shippingMode.label,
    },
  ];
  if (hours !== null) {
    rows.push({
      key: 'duration',
      label: t('marketplace.deals.dossier.duration'),
      value: formatDuration(t, hours),
      hint: withProduct
        ? t('marketplace.deals.dossier.durationHint')
        : undefined,
    });
  }
  if (deal.sentAt !== null) {
    rows.push({
      key: 'sent',
      label: t('marketplace.deals.dossier.sent'),
      value: formatDate(deal.sentAt, SENT_FORMAT, i18n.language),
    });
  }
  if (role === 'brand') {
    rows.push({
      key: 'total',
      label: t('marketplace.deals.dossier.total'),
      value: <MoneyText value={deal.total} size="md" />,
      emphasis: 'strong',
    });
  }

  return (
    <Box style={styles.card}>
      {rows.map(({ key, ...row }, index) => (
        <Box key={key}>
          {index > 0 ? <Divider /> : null}
          <KeyValueRow {...row} />
        </Box>
      ))}
    </Box>
  );
};

export const DealDossierLogistics = memo(DealDossierLogisticsComponent);
