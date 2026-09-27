import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, LayoutToggle, ListGroup, Text, useListLayout } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { ShowcaseLinkRow } from '../components';
import { useShowcaseNavigation } from '../hooks/useShowcaseNavigation';

/** A virtualized list can't nest in this scroll view, so the live list has its own screen. */
const SuperListDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useShowcaseNavigation();
  const { layout, setLayout } = useListLayout();
  const openListScreen = useCallback(
    () => navigation.navigate('LayoutListStatesScreen'),
    [navigation],
  );

  return (
    <Box gap="md">
      <Box row align="center" justify="space-between">
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('devShowcase.superList.toggleLabel', { layout })}
        </Text>
        <LayoutToggle currentLayout={layout} onLayoutChange={setLayout} />
      </Box>
      <ListGroup>
        <ShowcaseLinkRow
          id="LayoutListStatesScreen"
          title={t('devShowcase.layoutGallery.listStatesTitle')}
          description={t('devShowcase.layoutGallery.listStatesDescription')}
          onPress={openListScreen}
        />
      </ListGroup>
    </Box>
  );
};

export const SuperListDemo = memo(SuperListDemoComponent);
