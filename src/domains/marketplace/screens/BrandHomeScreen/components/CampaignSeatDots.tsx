import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, ProgressBar, Text } from '@/shared/ui';
import type { CampaignSeatSplit } from '../../../utils/campaignHome';

const DOT_GAP = moderateScale(6);
/** More seats than this read as one bar: a longer dot row would crowd out the count beside it. */
const MAX_DOTS = 8;

type DotKind = 'filled' | 'awaiting' | 'empty';

interface CampaignSeatDotsProps {
  seats: CampaignSeatSplit;
}

/**
 * The campaign's seats as equal dots: teal = a creator you paid for, amber = chosen and waiting for
 * your money, hollow ring = still free. Never color-only: the count beside the dots says it.
 */
const CampaignSeatDotsComponent: React.FC<CampaignSeatDotsProps> = ({ seats }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const warning = resolveHue(colors, 'warning');
  const styles = useStyles(
    ({ borderWidths, sizes }): Record<'dots' | 'dot' | DotKind | 'bar', ViewStyle> => ({
      dots: { flexDirection: 'row', alignItems: 'center', gap: DOT_GAP },
      dot: { width: sizes.control.dot, height: sizes.control.dot, borderRadius: sizes.control.dot / 2 },
      filled: { backgroundColor: colors.interactive.main },
      awaiting: { backgroundColor: warning.main },
      empty: { borderWidth: borderWidths.sm, borderColor: colors.border.strong },
      bar: { flex: 1 },
    }),
    [colors.border.strong, colors.interactive.main, warning.main],
  );
  const total = seats.filled + seats.awaiting + seats.empty;
  const booked = seats.filled + seats.awaiting;
  const label = t('marketplace.brandHome.campaigns.seatsA11y', {
    filled: seats.filled,
    awaiting: seats.awaiting,
    total,
  });
  const kinds: DotKind[] = [
    ...Array<DotKind>(seats.filled).fill('filled'),
    ...Array<DotKind>(seats.awaiting).fill('awaiting'),
    ...Array<DotKind>(seats.empty).fill('empty'),
  ];

  return (
    <Box row align="center" gap="md" accessible accessibilityLabel={label}>
      {total > MAX_DOTS ? (
        <Box style={styles.bar}>
          <ProgressBar value={total > 0 ? booked / total : 0} accessibilityLabel={label} />
        </Box>
      ) : (
        <Box style={styles.dots}>
          {kinds.map((kind, index) => (
            <Box key={index} style={[styles.dot, styles[kind]]} />
          ))}
        </Box>
      )}
      <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
        {t('marketplace.brandHome.campaigns.seatsBooked', {
          booked: formatNumber(booked),
          total: formatNumber(total),
        })}
      </Text>
    </Box>
  );
};

export const CampaignSeatDots = memo(CampaignSeatDotsComponent);
