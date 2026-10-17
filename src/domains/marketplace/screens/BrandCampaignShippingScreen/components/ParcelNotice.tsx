import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Lock, MapPinOff } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { resolveHue, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { Timestamp } from '../../../types/deal';
import { campaignDropClockParts } from '../../../utils/campaignDrop';

const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

export type ParcelNoticeKind =
  /** The server refused the row: its words, untouched. */
  | { kind: 'failed'; message: string }
  /** The creator's brief review runs until `opensAt` (`null`: the server didn't say when). */
  | { kind: 'brief'; opensAt: Timestamp | null }
  | { kind: 'address' };

/** Why a parcel can't ship, or why it didn't: one line under its header, tinted by what it asks of the brand. */
const ParcelNoticeComponent: React.FC<ParcelNoticeKind> = props => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  // Only a brief lock ticks; the hook runs for every kind and idles on `null`.
  const seconds = useCountdown(props.kind === 'brief' ? props.opensAt : null);
  const tone: HueTone = props.kind === 'failed' ? 'danger' : props.kind === 'brief' ? 'warning' : 'neutral';
  const hue = resolveHue(colors, tone);
  const Icon = props.kind === 'failed' ? AlertTriangle : props.kind === 'brief' ? Lock : MapPinOff;

  const message = (() => {
    switch (props.kind) {
      case 'failed':
        return props.message;
      case 'brief': {
        if (props.opensAt === null || seconds === 0) return t('marketplace.campaign.shipping.parcel.briefWindowOpen');
        const parts = campaignDropClockParts(seconds);
        const remaining = `${pad(parts.days * 24 + parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
        return t('marketplace.campaign.shipping.parcel.briefWindow', { remaining: isolateLtr(remaining) });
      }
      case 'address':
        return t('marketplace.campaign.shipping.parcel.addressMissing');
      default: {
        const _exhaustive: never = props;
        return _exhaustive;
      }
    }
  })();

  return (
    <Box row align="flex-start" gap="sm" mx="md" mb="sm" px="md" py="sm" borderRadius="md" bg={hue.soft} accessible accessibilityRole="alert">
      <Icon size={sizes.icon.xs} color={hue.text} />
      <Box flex={1}>
        <Text variant="bodySmall" color={hue.text}>
          {message}
        </Text>
      </Box>
    </Box>
  );
};

export const ParcelNotice = memo(ParcelNoticeComponent);
