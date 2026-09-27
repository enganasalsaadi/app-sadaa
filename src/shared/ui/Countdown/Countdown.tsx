import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Clock } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import type { HueTone } from '@/core/theme';
import { StatusPill } from '../StatusPill';
import type { StatusPillSize } from '../StatusPill';
import { splitCountdown } from './splitCountdown';
import type { CountdownParts } from './splitCountdown';

const DAY_SECONDS = 86400;
const pad = (n: number): string => formatNumber(n, { minimumIntegerDigits: 2 });

export interface CountdownProps {
  /** Deadline, epoch ms (from the server). `null` = no deadline → renders nothing. */
  endsAt: number | null;
  /** What ends ("Draft due"). */
  label?: string;
  /** Turns `warning` below this many seconds. Default one day. */
  warnBelow?: number;
  size?: StatusPillSize;
}

const formatParts = (t: TFunction, parts: CountdownParts): string => {
  switch (parts.kind) {
    case 'days':
      return t('common.countdown.days', { days: formatNumber(parts.days), hours: formatNumber(parts.hours) });
    case 'hours':
      return t('common.countdown.hours', { hours: formatNumber(parts.hours), minutes: pad(parts.minutes) });
    case 'minutes':
      return t('common.countdown.minutes', { minutes: formatNumber(parts.minutes), seconds: pad(parts.seconds) });
    case 'expired':
      return t('common.countdown.expired');
    default: {
      const _exhaustive: never = parts;
      return _exhaustive;
    }
  }
};

/** Deadline pill (draft due, review window, offer expiry). Ticks from a timestamp via `useCountdown`. */
const CountdownComponent: React.FC<CountdownProps> = ({
  endsAt,
  label,
  warnBelow = DAY_SECONDS,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const remaining = useCountdown(endsAt);

  if (endsAt === null) return null;

  const time = formatParts(t, splitCountdown(remaining));
  const tone: HueTone = remaining === 0 ? 'danger' : remaining < warnBelow ? 'warning' : 'neutral';

  return (
    <StatusPill
      icon={Clock}
      tone={tone}
      size={size}
      label={label ? t('common.countdown.withLabel', { label, time }) : time}
    />
  );
};

export const Countdown = memo(CountdownComponent);
