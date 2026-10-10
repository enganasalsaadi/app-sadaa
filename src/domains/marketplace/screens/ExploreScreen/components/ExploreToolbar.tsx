import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, BadgeCheck, LayoutGrid, SlidersHorizontal, Zap } from 'lucide-react-native';
import { Chip, ChipRow } from '@/shared/ui';
import type { ExploreQuickToggle, ExploreScreenModel } from '../hooks/useExploreScreen';

const FILTERS = 'filters';
const SORT = 'sort';
const CATEGORY = 'category';

type ExploreToolbarProps = Pick<
  ExploreScreenModel,
  | 'filterCount'
  | 'sortLabel'
  | 'sortSet'
  | 'kycVerified'
  | 'rush'
  | 'toggleQuick'
  | 'categoryLabel'
  | 'clearCategory'
  | 'openFilters'
  | 'openSort'
>;

/** Pinned under the search: filter sheet (with its count), sort sheet, the Home category, two quick toggles. */
const ExploreToolbarComponent: React.FC<ExploreToolbarProps> = ({
  filterCount,
  sortLabel,
  sortSet,
  kycVerified,
  rush,
  toggleQuick,
  categoryLabel,
  clearCategory,
  openFilters,
  openSort,
}) => {
  const { t } = useTranslation();
  const onQuick = useCallback(
    (value: string) => {
      if (value === 'kycVerified' || value === 'rush') toggleQuick(value);
    },
    [toggleQuick],
  );
  const filtersLabel = filterCount
    ? t('marketplace.explore.filtersCount', { count: filterCount })
    : t('marketplace.explore.filters');

  return (
    <ChipRow accessibilityLabel={t('marketplace.explore.toolbarA11y')}>
      <Chip
        label={filtersLabel}
        value={FILTERS}
        icon={SlidersHorizontal}
        dropdown
        selected={filterCount > 0}
        onSelect={openFilters}
      />
      <Chip label={sortLabel} value={SORT} icon={ArrowUpDown} dropdown selected={sortSet} onSelect={openSort} />
      {categoryLabel ? (
        <Chip
          label={categoryLabel}
          value={CATEGORY}
          icon={LayoutGrid}
          selected
          onSelect={clearCategory}
          onClear={clearCategory}
          clearLabel={t('marketplace.explore.clearCategory', { category: categoryLabel })}
        />
      ) : null}
      <Chip
        label={t('marketplace.explore.quick.verified')}
        value={'kycVerified' satisfies ExploreQuickToggle}
        icon={BadgeCheck}
        selectionMode="multiple"
        selected={kycVerified}
        onSelect={onQuick}
      />
      <Chip
        label={t('marketplace.explore.quick.rush')}
        value={'rush' satisfies ExploreQuickToggle}
        icon={Zap}
        selectionMode="multiple"
        selected={rush}
        onSelect={onQuick}
      />
    </ChipRow>
  );
};

export const ExploreToolbar = memo(ExploreToolbarComponent);
