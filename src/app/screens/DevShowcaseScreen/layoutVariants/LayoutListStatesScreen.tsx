import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Inbox } from 'lucide-react-native';
import {
  Box,
  Card,
  ChipGroup,
  Layout,
  LayoutToggle,
  SuperList,
  Text,
} from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { useTheme } from '@/core/theme';
import { useLayoutListStatesScreen } from './hooks/useLayoutListStatesScreen';
import type { MockListRow } from './hooks/useLayoutListStatesScreen';

const keyExtractor = (row: MockListRow) => row.id;

const ListRowCard: React.FC<{ row: MockListRow }> = memo(({ row }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box p="xs" flex={1}>
      <Card>
        <Text variant="bodyMedium">
          {t('devShowcase.listStates.rowTitle', { index: row.index })}
        </Text>
        <Text variant="caption" color={colors.text.secondary} mt="xs">
          {t('devShowcase.listStates.rowBody')}
        </Text>
      </Card>
    </Box>
  );
});

/** List archetype (rule 09): static Layout + SuperList, with every required state one tap away. */
const LayoutListStatesScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const {
    state,
    stateItems,
    onChangeState,
    layout,
    setLayout,
    data,
    isLoading,
    isError,
    isRefreshing,
    onRefresh,
    onRetry,
  } = useLayoutListStatesScreen();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MockListRow>) => <ListRowCard row={item} />,
    [],
  );

  return (
    <Layout
      mode="static"
      padding={{ y: 'md' }}
      header={{ title: t('devShowcase.layoutGallery.listStatesTitle') }}
    >
      <Box gap="md" pb="md">
        <ChipGroup
          items={stateItems}
          value={state}
          onChange={onChangeState}
          accessibilityLabel={t('devShowcase.listStates.stateLabel')}
        />
        <Box row justify="flex-end">
          <LayoutToggle currentLayout={layout} onLayoutChange={setLayout} />
        </Box>
      </Box>
      <SuperList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        layout={layout}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onRetry={onRetry}
        emptyMessage={t('devShowcase.listStates.emptyMessage')}
        emptyIcon={Inbox}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const LayoutListStatesScreen = memo(LayoutListStatesScreenComponent);
