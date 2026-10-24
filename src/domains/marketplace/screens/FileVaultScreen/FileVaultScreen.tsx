import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { CheckCheck, FolderOpen, ListChecks } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, Chip, ChipRow, FileViewer, Layout, SuperList, type LayoutHeaderConfig } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import type { DealRole } from '../../types';
import type { VaultRow } from '../../utils/dealVault';
import { VaultDeck } from './components/VaultDeck';
import { VaultDock, type VaultDockMode } from './components/VaultDock';
import { VaultGroupHeader } from './components/VaultGroupHeader';
import { VaultLockCard } from './components/VaultLockCard';
import { VaultSectionHeader } from './components/VaultSectionHeader';
import { VaultSkeleton } from './components/VaultSkeleton';
import { VaultTile } from './components/VaultTile';
import { useFileVaultScreen, type VaultSource } from './hooks/useFileVaultScreen';

const COLUMNS = 3;

const keyExtractor = (row: VaultRow): string => {
  switch (row.type) {
    case 'section':
      return `section:${row.key}`;
    case 'group':
      return row.id;
    case 'tile':
      return row.file.id;
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
};
const getItemType = (row: VaultRow) => row.type;
const overrideItemLayout = (layout: { span?: number }, row: VaultRow) => {
  layout.span = row.type === 'tile' ? 1 : COLUMNS;
};

interface FileVaultScreenProps {
  /** Picked by the role's navigator (rule 01). */
  source: VaultSource;
  role: DealRole;
}

/**
 * The files vault: every file on a deal (both roles) or a campaign (brand), grouped by where it
 * belongs, under a navy deck with the count and weight. Tap = the viewer, the corner disc = save one,
 * long-press = select, the dock = download everything (or the selection) through the shared queue.
 */
const FileVaultScreenComponent: React.FC<FileVaultScreenProps> = ({ source, role }) => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useFileVaultScreen(source, role);
  const { sectionName, groupName, selecting, selected, toggleMany, toggle, enterSelect, saveOne, viewer } = vm;

  const styles = useStyles(
    ({ spacing, sizes }): Record<'list' | 'header', ViewStyle> => ({
      list: {
        paddingHorizontal: spacing.xl - spacing.xs / 2,
        paddingBottom: sizes.vault.dockRing + spacing['7xl'],
      },
      // The deck, lock and chips keep the screen gutter; the grid's cells pad themselves.
      header: { marginHorizontal: -(spacing.xl - spacing.xs / 2), paddingHorizontal: spacing.xl, gap: spacing.sm },
    }),
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<VaultRow>) => {
      switch (item.type) {
        case 'section':
          return (
            <VaultSectionHeader
              title={sectionName(item.key)}
              count={item.count}
              bytes={item.bytes}
              ids={item.ids}
              selecting={selecting}
              allPicked={item.ids.length > 0 && item.ids.every(id => selected.has(id))}
              onToggleSection={toggleMany}
            />
          );
        case 'group':
          return <VaultGroupHeader title={groupName(item.label) ?? ''} />;
        case 'tile':
          return (
            <VaultTile
              file={item.file}
              selecting={selecting}
              selected={selected.has(item.file.id)}
              selectable={vm.canBatch}
              onOpen={viewer.open}
              onSelect={enterSelect}
              onToggle={toggle}
              onSave={saveOne}
            />
          );
        default: {
          const _exhaustive: never = item;
          return _exhaustive;
        }
      }
    },
    [enterSelect, groupName, saveOne, sectionName, selected, selecting, toggle, toggleMany, viewer.open, vm.canBatch],
  );

  const rowState = useMemo(() => [selecting, selected], [selected, selecting]);
  const { setFilter, chips } = vm;
  const pick = useCallback(
    (value: string) => {
      const chip = chips.find(entry => entry.value === value);
      if (chip) setFilter(chip.value);
    },
    [chips, setFilter],
  );

  const listHeader = vm.vault ? (
    <Box style={styles.header}>
      {vm.totals && vm.totals.count > 0 ? (
        <VaultDeck
          kicker={vm.kicker}
          count={vm.totals.count}
          bytes={vm.totals.bytes}
          previews={vm.previews}
          sections={vm.totals.sections}
        />
      ) : null}
      {vm.vault.briefLocked ? <VaultLockCard /> : null}
      {chips.length > 2 ? (
        <ChipRow accessibilityLabel={t('marketplace.vault.filters')}>
          {chips.map(chip => (
            <Chip
              key={chip.value}
              variant="solid"
              label={chip.label}
              value={chip.value}
              count={chip.count}
              selected={vm.filter === chip.value}
              onSelect={pick}
            />
          ))}
        </ChipRow>
      ) : null}
    </Box>
  ) : null;

  const { exitSelect, toggleAll, allSelected, title, subtitle, selectedCount } = vm;
  const canSelect = vm.canBatch;
  const header = useMemo<LayoutHeaderConfig>(() => {
    if (selecting) {
      return {
        title: t('marketplace.vault.select.title', { count: selectedCount }),
        backIcon: 'close',
        onBackPress: exitSelect,
        actions: [
          {
            icon: CheckCheck,
            accessibilityLabel: allSelected ? t('marketplace.vault.select.none') : t('marketplace.vault.select.all'),
            onPress: toggleAll,
            active: allSelected,
          },
        ],
      };
    }
    return {
      title,
      subtitle,
      actions: canSelect
        ? [{ icon: ListChecks, accessibilityLabel: t('marketplace.vault.select.enter'), onPress: () => enterSelect() }]
        : undefined,
    };
  }, [allSelected, canSelect, enterSelect, exitSelect, selecting, subtitle, t, title, toggleAll, selectedCount]);

  const dockMode = useMemo<VaultDockMode | null>(() => {
    if (vm.batch) {
      return {
        type: 'batch',
        batch: vm.batch,
        flyer: vm.flyer,
        onCancel: vm.cancelBatch,
        onDismiss: vm.dismissBatch,
        onRetry: vm.retryBatch,
        onSaveReady: vm.saveReady,
      };
    }
    if (!vm.canBatch) return null;
    if (selecting) {
      return { type: 'select', count: vm.selectedCount, bytes: vm.selectedBytes, onDownload: vm.downloadSelected };
    }
    return { type: 'idle', hint: vm.hint, bytes: vm.viewerBytes, onDownload: vm.downloadAll };
  }, [selecting, vm]);

  const emptyDescription = vm.vault?.briefLocked
    ? t('marketplace.vault.empty.locked')
    : source === 'deal'
      ? t('marketplace.vault.empty.deal')
      : t('marketplace.vault.empty.campaign');

  return (
    <Layout
      mode="static"
      padding="none"
      header={header}
      overlay={dockMode ? <VaultDock mode={dockMode} /> : undefined}
    >
      <SuperList
        data={vm.rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        overrideItemLayout={overrideItemLayout}
        stickyHeaderIndices={vm.sticky}
        separators={false}
        layout="grid-3"
        extraData={rowState}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.refreshing}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyIcon={FolderOpen}
        emptyMessage={t('marketplace.vault.empty.title')}
        emptyDescription={emptyDescription}
        errorMessage={t('marketplace.vault.loadFailed')}
        ListHeaderComponent={listHeader}
        ListSkeletonComponent={<VaultSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <FileViewer {...viewer.props} refreshUrl={vm.refreshUrl} />
    </Layout>
  );
};

export const FileVaultScreen = memo(FileVaultScreenComponent);
