import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import type { ViewStyle } from 'react-native';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import type { CompareCell, CompareRow } from '../hooks/useBrandCampaignCompareScreen';

const CELL_MIN_HEIGHT = moderateScale(56);

const CompareCellView = memo<{ cell: CompareCell; money: boolean }>(({ cell, money }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  // Money leads in the money hue (the cheapest is a money fact); every other lead in teal.
  const hue = money ? resolveHue(colors, 'money') : resolveHue(colors, 'interactive');
  const lead = cell.leader !== null;
  const styles = useStyles(
    ({ radii, spacing }): Record<'cell', ViewStyle> => ({
      cell: {
        flex: 1,
        minHeight: CELL_MIN_HEIGHT,
        borderRadius: radii.md,
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: lead ? hue.soft : colors.surface.main,
      },
    }),
    [lead, hue.soft, colors.surface.main],
  );
  const color = lead ? hue.text : colors.text.primary;
  const caption =
    cell.leader === 'lowest'
      ? t('marketplace.campaign.applicants.compare.result.lowest')
      : cell.leader === 'highest'
        ? t('marketplace.campaign.applicants.compare.result.highest')
        : null;

  return (
    <Box style={styles.cell}>
      {cell.money ? (
        <MoneyText value={cell.money} size="md" />
      ) : (
        <Text variant="title" color={color} align="center">
          {cell.text}
        </Text>
      )}
      {caption || cell.caption ? (
        <Box row align="center" gap="xs">
          {caption ? <Check size={sizes.icon.xs} color={hue.main} strokeWidth={iconStroke.bold} /> : null}
          <Text variant="caption" color={lead ? hue.text : colors.text.secondary} align="center">
            {[caption, cell.caption].filter(Boolean).join(' · ')}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
});

export interface CompareRowViewProps {
  row: CompareRow;
}

/** One figure across the columns: its name above, a cell per creator, the lead marked by a tint and a word. */
const CompareRowViewComponent: React.FC<CompareRowViewProps> = ({ row }) => {
  const { colors } = useTheme();
  return (
    <Box gap="xs" accessible={false}>
      <Text variant="caption" color={colors.text.secondary}>
        {row.label}
      </Text>
      <Box row gap="sm">
        {row.cells.map(cell => (
          <CompareCellView key={cell.key} cell={cell} money={row.key === 'price'} />
        ))}
      </Box>
    </Box>
  );
};

export const CompareRowView = memo(CompareRowViewComponent);
