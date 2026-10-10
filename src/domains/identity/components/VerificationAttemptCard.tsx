import React, { memo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock,
  X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, StatusPill, Text } from '@/shared/ui';

/** `waiting`: sent, Sada or the brand still has to act. `failed`: rejected or expired, try again. */
export type VerificationAttemptTone = 'waiting' | 'failed';

const TONE_LOOK = {
  waiting: { hue: 'warning', tileIcon: Clock, pillIcon: Clock },
  failed: { hue: 'danger', tileIcon: CircleX, pillIcon: X },
} as const satisfies Record<
  VerificationAttemptTone,
  { hue: 'warning' | 'danger'; tileIcon: LucideIcon; pillIcon: LucideIcon }
>;

export interface VerificationAttemptCardProps {
  tone: VerificationAttemptTone;
  title: string;
  /** Server `status_label` (local fallback when missing). */
  statusLabel: string;
  body: string;
  onPress: () => void;
}

/** One open verification attempt at the top of the picker; the whole card opens its route. */
const VerificationAttemptCardComponent: React.FC<
  VerificationAttemptCardProps
> = ({ tone, title, statusLabel, body, onPress }) => {
  const { colors, sizes, isRTL } = useTheme();
  const look = TONE_LOOK[tone];
  const hue = colors.status[look.hue];
  const TileIcon = look.tileIcon;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card
      p="lg"
      onPress={onPress}
      accessibilityLabel={`${title}, ${statusLabel}`}
    >
      <Box gap="md">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.sm}
            height={sizes.iconButton.sm}
            borderRadius="md"
            bg={hue.soft}
            align="center"
            justify="center"
          >
            <TileIcon size={sizes.icon.sm} color={hue.main} />
          </Box>
          <Box flex={1} gap="xs" align="flex-start">
            <Text variant="bodyMedium">{title}</Text>
            <StatusPill
              tone={look.hue}
              size="sm"
              icon={look.pillIcon}
              label={statusLabel}
            />
          </Box>
          <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
        </Box>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {body}
        </Text>
      </Box>
    </Card>
  );
};

export const VerificationAttemptCard = memo(VerificationAttemptCardComponent);
