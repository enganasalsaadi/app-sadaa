import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { AlarmClock, Hourglass, type LucideIcon } from 'lucide-react-native';
import { resolveHue, useStyles, useTheme, type HueTone } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export type ReviewBannerKind = 'asIs' | 'waiting' | 'decided';

const LOOK = {
  asIs: { tone: 'warning', icon: AlarmClock },
  waiting: { tone: 'info', icon: Hourglass },
  decided: { tone: 'neutral', icon: Hourglass },
} as const satisfies Record<ReviewBannerKind, { tone: HueTone; icon: LucideIcon }>;

export interface ReviewBannerProps {
  kind: ReviewBannerKind;
  title: string;
  body?: string | null;
}

/** Why the round can't be reviewed the usual way right now (late creator, waiting, decided). */
const ReviewBannerComponent: React.FC<ReviewBannerProps> = ({ kind, title, body }) => {
  const { colors, sizes } = useTheme();
  const { tone, icon: Icon } = LOOK[kind];
  const hue = resolveHue(colors, tone);
  const styles = useStyles(
    ({ radii, spacing }): Record<'banner', ViewStyle> => ({
      banner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: hue.soft,
      },
    }),
    [hue.soft],
  );
  return (
    <Box style={styles.banner} accessible>
      <Icon size={sizes.icon.md} color={hue.main} />
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {title}
        </Text>
        {body ? (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {body}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export const ReviewBanner = memo(ReviewBannerComponent);
