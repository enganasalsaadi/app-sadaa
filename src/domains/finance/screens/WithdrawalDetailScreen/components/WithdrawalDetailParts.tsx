import React, { memo, useCallback } from 'react';
import { Copy } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Divider, KeyValueRow, MoneyText, Pressable, Skeleton, StatusPill, Text } from '@/shared/ui';
import type { DetailRow, WithdrawalDetailScreenModel } from '../hooks/useWithdrawalDetailScreen';

const ICON_CIRCLE = moderateScale(56);
const SKELETON_TITLE_WIDTH = moderateScale(160);
const SKELETON_AMOUNT_WIDTH = moderateScale(140);
const SKELETON_AMOUNT_HEIGHT = moderateScale(36);
const SKELETON_CARD_HEIGHT = moderateScale(148);

type DetailView = NonNullable<WithdrawalDetailScreenModel['view']>;

/** 56px status circle, description, the signed amount (struck through when it never left), pill. */
export const WithdrawalHead = memo<{ view: DetailView }>(({ view }) => {
  const { colors, sizes } = useTheme();
  const Icon = view.look?.icon;
  return (
    <Box align="center" gap="sm" pt="md">
      {Icon ? (
        <Box
          width={ICON_CIRCLE}
          height={ICON_CIRCLE}
          borderRadius="full"
          bg={view.badge.bg}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.md} color={view.badge.icon} />
        </Box>
      ) : null}
      <Text variant="bodySmall" color={colors.text.secondary} align="center">
        {view.title}
      </Text>
      <MoneyText value={view.amount} size="lg" tone={view.lost ? 'muted' : 'default'} strikethrough={view.lost} />
      {view.statusLabel ? (
        <StatusPill label={view.statusLabel} tone={view.look?.tone ?? 'neutral'} icon={view.look?.icon} size="md" />
      ) : null}
    </Box>
  );
});

const CopyValue = memo<{ value: string; onCopy: (value: string) => void }>(({ value, onCopy }) => {
  const { colors, sizes } = useTheme();
  const press = useCallback(() => onCopy(value), [onCopy, value]);
  return (
    <Pressable
      onPress={press}
      row
      align="center"
      gap="xs"
      minHeight={sizes.button.sm}
      accessibilityRole="button"
      accessibilityLabel={value}
    >
      <Text variant="bodyMedium" selectable>
        {value}
      </Text>
      <Copy size={sizes.icon.xs} color={colors.interactive.main} />
    </Pressable>
  );
});

/** A labelled card of rows; copyable values carry a copy icon. */
export const DetailRowsCard = memo<{ title: string; rows: readonly DetailRow[]; onCopy: (value: string) => void }>(
  ({ title, rows, onCopy }) => {
    const { colors } = useTheme();
    return (
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
          {title}
        </Text>
        <Card px="lg" py="sm">
          {rows.map((row, index) => (
            <Box key={row.key}>
              {index > 0 ? <Divider /> : null}
              <Box py="xs">
                <KeyValueRow
                  label={row.label}
                  value={row.copy ? <CopyValue value={row.value} onCopy={onCopy} /> : row.value}
                />
              </Box>
            </Box>
          ))}
        </Card>
      </Box>
    );
  },
);

export const WithdrawalDetailSkeleton = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="2xl" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box align="center" gap="sm" pt="md">
        <Skeleton width={ICON_CIRCLE} height={ICON_CIRCLE} borderRadius="full" />
        <Skeleton width={SKELETON_TITLE_WIDTH} height={sizes.icon.sm} borderRadius="xs" />
        <Skeleton width={SKELETON_AMOUNT_WIDTH} height={SKELETON_AMOUNT_HEIGHT} borderRadius="xs" />
      </Box>
      <Skeleton width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
      <Skeleton width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
    </Box>
  );
});
