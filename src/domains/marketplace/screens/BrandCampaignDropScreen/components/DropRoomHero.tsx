import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useStyles } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { CampaignDropBoard } from '../../../types/campaignDrop';
import { campaignDropView, sortDropReminders } from '../../../utils/campaignDrop';
import { DropBeacons } from './DropBeacons';
import { DropCountdown } from './DropCountdown';
import { DropOnAir } from './DropOnAir';
import { DropStations } from './DropStations';

export interface DropRoomHeroProps {
  board: CampaignDropBoard;
  title: string;
  subtitle: string;
}

/**
 * The launch room's top, transparent over the live gradient (Layout paints it): the title, then
 * the clock of the next moment (the live link opening, then the drop) or, once on air, the ring of
 * verified creators; under it the three stations and the reminders the server sends.
 */
const DropRoomHeroComponent: React.FC<DropRoomHeroProps> = ({ board, title, subtitle }) => {
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const now = useClock(1000);
  const view = campaignDropView(board, now);
  const reminders = useMemo(() => sortDropReminders(board.reminders), [board.reminders]);
  const styles = useStyles(
    (): Record<'container' | 'titleRow', ViewStyle> => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the back button.
      titleRow: { minHeight: sizes.iconButton.md, paddingStart: sizes.iconButton.md + spacing.sm, justifyContent: 'center' },
    }),
    [sizes.iconButton.md, spacing.sm, top],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="xl">
      <Box style={styles.titleRow}>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {subtitle}
        </Text>
      </Box>
      {view.next ? (
        <DropCountdown moment={view.next.moment} endsAt={view.next.at} then={view.then} />
      ) : (
        <DropOnAir totals={board.totals} dropAt={board.dropAt} now={now} />
      )}
      <DropStations phase={view.phase} />
      <DropBeacons reminders={reminders} />
    </Box>
  );
};

export const DropRoomHero = memo(DropRoomHeroComponent);
