import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, StatusPill, Tag, Text } from '@/shared/ui';
import type { PayoutMethodView } from '../utils/payoutMethodView';

export interface PayoutMethodRowProps {
  method: PayoutMethodView;
  onPress: (id: string) => void;
  /** Wallet card: one line, no currency tags. */
  compact?: boolean;
}

/** One saved payout method inside a grouped card: badge, name + primary pill, masked details, currencies. */
const PayoutMethodRowComponent: React.FC<PayoutMethodRowProps> = ({ method, onPress, compact = false }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(() => ({ title: { flexShrink: 1 } }));
  const Icon = method.icon;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const press = useCallback(() => onPress(method.id), [method.id, onPress]);
  const primaryLabel = t('finance.payouts.primary');

  return (
    <Pressable
      row
      align="center"
      gap="md"
      px="lg"
      py="md"
      minHeight={sizes.button.lg}
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={[method.title, method.isDefault ? primaryLabel : null, method.meta]
        .filter(Boolean)
        .join(', ')}
      accessibilityHint={t('finance.payouts.list.editHint')}
    >
      <Box
        width={sizes.iconButton.sm}
        height={sizes.iconButton.sm}
        borderRadius="md"
        bg={colors.brand.soft}
        align="center"
        justify="center"
      >
        <Icon size={sizes.icon.sm} color={colors.brand.text} />
      </Box>
      <Box flex={1} gap="xs">
        <Box row align="center" gap="sm">
          <Text variant="bodyMedium" numberOfLines={1} style={styles.title}>
            {method.title}
          </Text>
          {method.isDefault ? <StatusPill label={primaryLabel} tone="interactive" icon={Check} size="sm" /> : null}
        </Box>
        {method.meta ? (
          <Text variant="caption" color={colors.text.secondary} numberOfLines={compact ? 1 : 2}>
            {method.meta}
          </Text>
        ) : null}
        {!compact && method.currencies.length > 0 ? (
          <Box row gap="xs">
            {method.currencies.map(code => (
              <Tag key={code} label={code} />
            ))}
          </Box>
        ) : null}
      </Box>
      <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
    </Pressable>
  );
};

export const PayoutMethodRow = memo(PayoutMethodRowComponent);
