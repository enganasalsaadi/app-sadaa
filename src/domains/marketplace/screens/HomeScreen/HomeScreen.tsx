import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/shared/ui/Layout';
import { Box, Text } from '@/shared/ui/primitives';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <Box flex={1} align="center" justify="center" py="7xl">
        <Text variant="h2">{t('tabs.home')}</Text>
      </Box>
    </Layout>
  );
};
