import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Accordion, Box, Card, Text } from '@/shared/ui';
import type { ContractTerms } from '@/core/api';

/** The catalog's contract terms, folded: every deal with this creator runs under them. */
const MediaKitTermsCardComponent: React.FC<{ terms: ContractTerms['items'] }> = ({ terms }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (terms.length === 0) return null;

  return (
    <Box px="xl">
      <Card px="lg">
        <Accordion
          title={t('account.mediaKit.previewScreen.terms')}
          subtitle={t('account.mediaKit.showcase.termsHint')}
        >
          <Box gap="md">
            {terms.map(item => (
              <Box key={item.key} row gap="sm">
                <ShieldCheck size={sizes.icon.sm} color={colors.interactive.main} />
                <Box flex={1}>
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {item.text}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Accordion>
      </Card>
    </Box>
  );
};

export const MediaKitTermsCard = memo(MediaKitTermsCardComponent);
