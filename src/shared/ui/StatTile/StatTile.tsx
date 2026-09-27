import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Skeleton } from '../Skeleton';

export type StatTileTone = 'default' | 'money';

export interface StatTileProps {
  label: string;
  /** Pre-formatted (`formatNumber` compact, `formatMoney`). */
  value: string;
  /** Change vs the previous period as a fraction: `0.08` = +8%. */
  change?: number;
  /** Period the change is measured over ("vs last 30 days"). */
  caption?: string;
  icon?: LucideIcon;
  /** `money` only when the value is money flow (earnings, spend), rule 08. */
  tone?: StatTileTone;
  loading?: boolean;
}

/** One metric (views, engagement, followers, earnings) with its trend. Lay out in rows of 2. */
const StatTileComponent: React.FC<StatTileProps> = ({
  label,
  value,
  change,
  caption,
  icon: Icon,
  tone = 'default',
  loading = false,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const trend = change === undefined ? null : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const trendHue =
    trend === 'up' ? colors.status.success : trend === 'down' ? colors.status.danger : colors.status.neutral;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const changeLabel =
    change === undefined
      ? null
      : formatNumber(change, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' });

  return (
    <Box
      flex={1}
      gap="xs"
      p="md"
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.border.default}
      bg={colors.surface.main}
      accessible
      accessibilityLabel={
        loading
          ? label
          : [label, value, changeLabel ? t('common.stat.change', { change: changeLabel }) : null, caption]
              .filter(Boolean)
              .join(', ')
      }
    >
      <Box row align="center" gap="xs">
        {Icon ? <Icon size={sizes.icon.xs} color={colors.icon.secondary} strokeWidth={iconStroke.bold} /> : null}
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {label}
        </Text>
      </Box>

      {loading ? (
        <Skeleton width="60%" height={sizes.icon.lg} borderRadius="sm" />
      ) : (
        <Text variant="amount" color={tone === 'money' ? colors.money.text : colors.text.primary} numberOfLines={1}>
          {value}
        </Text>
      )}

      {!loading && (changeLabel || caption) ? (
        <Box row align="center" gap="xs" wrap>
          {changeLabel ? (
            <Box row align="center" gap="xs">
              <TrendIcon size={sizes.icon.xs} color={trendHue.main} strokeWidth={iconStroke.bold} />
              <Text variant="caption" color={trendHue.text}>
                {changeLabel}
              </Text>
            </Box>
          ) : null}
          {caption ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {caption}
            </Text>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export const StatTile = memo(StatTileComponent);
