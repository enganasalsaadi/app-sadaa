import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, Box, Divider, MoneyText, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { MOCK_CREATOR_PRICE } from './mockData';

const AccordionDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box>
      <Accordion title={t('devShowcase.accordion.escrowQ')} defaultExpanded>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.accordion.escrowA')}
        </Text>
      </Accordion>
      <Divider />
      <Accordion
        title={t('devShowcase.accordion.payoutQ')}
        subtitle={t('devShowcase.accordion.payoutSubtitle')}
      >
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.accordion.payoutA')}
        </Text>
      </Accordion>
      <Divider />
      <Accordion
        title={t('devShowcase.accordion.priceQ')}
        subtitle={t('devShowcase.accordion.priceSubtitle')}
        trailing={<MoneyText value={MOCK_CREATOR_PRICE} />}
      >
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.accordion.priceA')}
        </Text>
      </Accordion>
      <Divider />
      <Accordion title={t('devShowcase.accordion.disputeQ')}>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.accordion.disputeA')}
        </Text>
      </Accordion>
    </Box>
  );
};

export const AccordionDemo = memo(AccordionDemoComponent);
