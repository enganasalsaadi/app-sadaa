import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, ProgressBar } from '@/shared/ui';
import type { CampaignSeatSplit } from '../../../utils/campaignHome';

const SEGMENT_HEIGHT = moderateScale(10);
/** More seats than this read as one bar: segments would shrink past a finger's worth. */
const MAX_SEGMENTS = 10;

type SegmentKind = 'filled' | 'awaiting' | 'empty';

interface CampaignSeatStripProps {
  seats: CampaignSeatSplit;
}

/**
 * The campaign's seats in one strip: teal = a creator you paid for, amber outline = chosen and
 * waiting for your money, dashed = still free. Never color-only: the caption beside it says it.
 */
const CampaignSeatStripComponent: React.FC<CampaignSeatStripProps> = ({ seats }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const warning = resolveHue(colors, 'warning');
  const styles = useStyles(
    ({ borderWidths }): Record<'segment' | SegmentKind, ViewStyle> => ({
      segment: { flex: 1, height: SEGMENT_HEIGHT, borderRadius: SEGMENT_HEIGHT / 2 },
      filled: { backgroundColor: colors.interactive.main },
      awaiting: { backgroundColor: warning.soft, borderWidth: borderWidths.md, borderColor: warning.main },
      empty: { borderWidth: borderWidths.md, borderStyle: 'dashed', borderColor: colors.border.strong },
    }),
    [colors.border.strong, colors.interactive.main, warning.main, warning.soft],
  );
  const total = seats.filled + seats.awaiting + seats.empty;
  const label = t('marketplace.brandHome.campaigns.seatsA11y', {
    filled: seats.filled,
    awaiting: seats.awaiting,
    total,
  });

  if (total > MAX_SEGMENTS) {
    return (
      <Box>
        <ProgressBar value={(seats.filled + seats.awaiting) / total} accessibilityLabel={label} />
      </Box>
    );
  }
  const kinds: SegmentKind[] = [
    ...Array<SegmentKind>(seats.filled).fill('filled'),
    ...Array<SegmentKind>(seats.awaiting).fill('awaiting'),
    ...Array<SegmentKind>(seats.empty).fill('empty'),
  ];
  return (
    <Box row gap="xs" accessible accessibilityLabel={label}>
      {kinds.map((kind, index) => (
        <Box key={index} style={[styles.segment, styles[kind]]} />
      ))}
    </Box>
  );
};

export const CampaignSeatStrip = memo(CampaignSeatStripComponent);
