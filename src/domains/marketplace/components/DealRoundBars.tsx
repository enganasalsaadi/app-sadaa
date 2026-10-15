import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';
import type { DealRoundState, DealRounds } from '../utils/dealDrafts';

const BAR_WIDTH = moderateScale(18);
const BAR_HEIGHT = moderateScale(4);

export interface DealRoundBarsProps {
  rounds: DealRounds;
}

/**
 * One short bar per possible round of a deliverable: amber = a round the brand sent back, teal =
 * the one now, hollow = still open. Read out as «round n of m».
 */
const DealRoundBarsComponent: React.FC<DealRoundBarsProps> = ({ rounds }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'bar' | DealRoundState, ViewStyle> => ({
      bar: { width: BAR_WIDTH, height: BAR_HEIGHT, borderRadius: radii.full },
      revised: { backgroundColor: colors.status.warning.main },
      current: { backgroundColor: colors.interactive.main },
      open: { backgroundColor: colors.border.default },
    }),
    [colors.border.default, colors.interactive.main, colors.status.warning.main],
  );
  return (
    <Box
      row
      gap="xs"
      align="center"
      accessible
      accessibilityLabel={t('marketplace.deals.drafts.rounds.a11y', {
        current: rounds.current,
        total: rounds.bars.length,
      })}
    >
      {rounds.bars.map(({ round, state }) => (
        <Box key={round} style={[styles.bar, styles[state]]} />
      ))}
    </Box>
  );
};

export const DealRoundBars = memo(DealRoundBarsComponent);
