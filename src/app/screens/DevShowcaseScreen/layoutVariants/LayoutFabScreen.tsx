import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { Box, FAB, Text, Layout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { DemoScrollRows } from '../components';

/** Layout gallery variant: `overlay` slot holding a `FAB` above scrolling content. */
const LayoutFabScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      header={{ title: t('devShowcase.layoutGallery.fabTitle') }}
      overlay={
        <FAB
          icon={Plus}
          label={t('devShowcase.fab.newCampaign')}
          onPress={goBack}
          accessibilityLabel={t('devShowcase.fab.newCampaign')}
        />
      }
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.layoutGallery.fabDescription')}
        </Text>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutFabScreen = memo(LayoutFabScreenComponent);
