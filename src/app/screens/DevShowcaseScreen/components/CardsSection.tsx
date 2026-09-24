import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';

interface CardsSectionProps {
  cardSelected: boolean;
  onToggleSelected: () => void;
}

/** Dev mock only — an escrow balance preview, not a real wallet value. */
const MOCK_ESCROW_BALANCE: Money = { amount: 125000, currency: 'USD' };

const CardsSectionComponent: React.FC<CardsSectionProps> = ({
  cardSelected,
  onToggleSelected,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const formattedBalance = useMemo(
    () => formatMoney(MOCK_ESCROW_BALANCE, i18n.language),
    [i18n.language],
  );

  return (
    <Card>
      <Box gap="lg">
        <Text variant="title">{t('devShowcase.sections.cards')}</Text>

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
    </Card>
  );
};

export const CardsSection = memo(CardsSectionComponent);
