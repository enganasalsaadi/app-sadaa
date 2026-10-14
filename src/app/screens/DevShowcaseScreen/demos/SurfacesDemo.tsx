import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card, Pressable, Rail } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useDisclosure } from '../hooks/useDisclosure';

/** Dev mock only — an escrow balance preview, not a real wallet value. */
const MOCK_ESCROW_BALANCE: Money = { amount: 125000, currency: 'USD' };
const RAIL_ITEMS = [1, 2, 3, 4];

const SurfacesDemoComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { visible: cardSelected, toggle: onToggleSelected } = useDisclosure();

  const formattedBalance = useMemo(
    () => formatMoney(MOCK_ESCROW_BALANCE, i18n.language),
    [i18n.language],
  );

  return (
    <Box gap="lg">
      <Box p="lg" gap="xs" borderRadius="md" bg={colors.surface.elevated}>
        <Text variant="bodyMedium">{t('devShowcase.cards.boxTitle')}</Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.cards.boxBody')}
        </Text>
      </Box>

      <Pressable
        p="lg"
        borderRadius="md"
        bg={colors.interactive.soft}
        scaleOnPress
        onPress={onToggleSelected}
        accessibilityRole="button"
        accessibilityLabel={t('devShowcase.cards.pressablePrimitiveTitle')}
      >
        <Text variant="bodyMedium" color={colors.interactive.text}>
          {t('devShowcase.cards.pressablePrimitiveTitle')}
        </Text>
      </Pressable>

      <Card>
        <Text variant="body">{t('devShowcase.cards.plainTitle')}</Text>
        <Text variant="bodySmall" color={colors.text.secondary} mt="xs">
          {t('devShowcase.cards.plainBody')}
        </Text>
      </Card>

      <Card
        onPress={onToggleSelected}
        selected={cardSelected}
        accessibilityLabel={t('devShowcase.cards.pressableTitle')}
      >
        <Text variant="body">{t('devShowcase.cards.pressableTitle')}</Text>
        <Text variant="bodySmall" color={colors.text.secondary} mt="xs">
          {t('devShowcase.cards.pressableBody')}
        </Text>
      </Card>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.cards.railTitle')}
        </Text>
        <Rail shadow="card" bleed>
          {RAIL_ITEMS.map(item => (
            <Card key={item} width={sizes.thumbnail.lg}>
              <Text variant="bodyMedium">{t('devShowcase.cards.railItem', { count: item })}</Text>
            </Card>
          ))}
        </Rail>
      </Box>

      <Card bg={colors.money.soft} borderColor={colors.money.soft}>
        <Text variant="bodySmall" color={colors.money.text}>
          {t('devShowcase.cards.moneyTitle')}
        </Text>
        <Text variant="amountLarge" color={colors.money.text} mt="xs">
          {formattedBalance}
        </Text>
        <Text variant="caption" color={colors.text.tertiary} mt="xs">
          {t('devShowcase.cards.moneyCaption')}
        </Text>
      </Card>
    </Box>
  );
};

export const SurfacesDemo = memo(SurfacesDemoComponent);
