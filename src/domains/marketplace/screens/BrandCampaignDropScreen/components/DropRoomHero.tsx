import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useStyles } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { CampaignDropBoard } from '../../../types/campaignDrop';
import { campaignDropView } from '../../../utils/campaignDrop';
import { DropCountdown } from './DropCountdown';
import { DropOnAir } from './DropOnAir';

export interface DropRoomHeroProps {
  board: CampaignDropBoard;
  title: string;
  subtitle: string;
}

/**
 * The launch room's top, transparent over the live gradient (Layout paints it): the title and one
 * strip, the clock of the next moment (the live link opening, then the drop) or, once on air, the
 * ring of verified creators. Kept short on purpose: the body slides over its foot, so the stations
 * and reminders live in the body (`DropRunway`).
 */
const DropRoomHeroComponent: React.FC<DropRoomHeroProps> = ({ board, title, subtitle }) => {
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const now = useClock(1000);
  const view = campaignDropView(board, now);
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
    <Box style={styles.container} px="xl" pb="4xl" gap="lg" mb='5xl'>
      <Box style={styles.titleRow}>
        <Text variant="h4" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {subtitle}
        </Text>
      </Box>
      {view.next ? (
        <DropCountdown moment={view.next.moment} endsAt={view.next.at} />
      ) : (
        <DropOnAir totals={board.totals} dropAt={board.dropAt} now={now} />
      )}
    </Box>
  );
};

export const DropRoomHero = memo(DropRoomHeroComponent);
