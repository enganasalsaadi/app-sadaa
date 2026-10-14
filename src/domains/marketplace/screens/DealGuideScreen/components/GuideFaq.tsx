import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Accordion, Box, Text } from '@/shared/ui';
import type { GuideCopy } from '../hooks/useDealGuideCopy';

/** The role's common questions, one open at a time is up to the reader. */
const GuideFaqComponent: React.FC<{ faq: GuideCopy['faq'] }> = ({ faq }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="md">
      <Text variant="h4" color={colors.text.primary} accessibilityRole="header">
        {t('marketplace.guide.faq')}
      </Text>
      <Box gap="sm">
        {faq.map(entry => (
          <Accordion key={entry.q} title={entry.q}>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {entry.a}
            </Text>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export const GuideFaq = memo(GuideFaqComponent);
