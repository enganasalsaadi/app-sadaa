import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  BottomSheet,
  Box,
  Checkbox,
  ChipGroup,
  CustomButton,
  CustomInput,
  FormSection,
  Notice,
  Pressable,
  Text,
} from '@/shared/ui';
import type { ExploreFilterOptions, ExploreFilters } from '../../../types/explore';
import type { ExploreDraftFlag, ExploreDraftList, ExploreDraftText } from '../../../utils/exploreFilters';
import { useExploreFilterDraft } from '../hooks/useExploreFilterDraft';

/** Niches shown before "More": the rest stay one tap away. */
const NICHES_PREVIEW = 8;
/** Mirrors the API's integer fields (followers up to hundreds of millions, prices in dollars). */
const FOLLOWERS_MAX_LENGTH = 9;
const PRICE_MAX_LENGTH = 6;

interface ExploreFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismissed: () => void;
  filters: ExploreFilters;
  options: ExploreFilterOptions | undefined;
  optionsLoading: boolean;
  optionsError: boolean;
  onRetryOptions: () => void;
  onApply: (draft: ReturnType<typeof useExploreFilterDraft>['draft']) => void;
  /** Prices hidden: the price section is shown 🔒 and opens the lock sheet. */
  priceLocked: boolean;
  onLocked: () => void;
}

const ListSection = memo<{
  title: string;
  field: ExploreDraftList;
  items: readonly { value: string; label: string }[];
  value: readonly string[];
  loading: boolean;
  onChange: (field: ExploreDraftList, value: string[]) => void;
}>(({ title, field, items, value, loading, onChange }) => {
  const change = useCallback((next: string[]) => onChange(field, next), [field, onChange]);
  return (
    <FormSection title={title}>
      <ChipGroup multiple items={items} value={value} onChange={change} loading={loading} accessibilityLabel={title} />
    </FormSection>
  );
});

const RangeInputs = memo<{
  minField: ExploreDraftText;
  maxField: ExploreDraftText;
  min: string;
  max: string;
  maxLength: number;
  editable: boolean;
  onChange: (field: ExploreDraftText, text: string) => void;
}>(({ minField, maxField, min, max, maxLength, editable, onChange }) => {
  const { t } = useTranslation();
  const changeMin = useCallback((text: string) => onChange(minField, text), [minField, onChange]);
  const changeMax = useCallback((text: string) => onChange(maxField, text), [maxField, onChange]);
  return (
    <Box row gap="md">
      <Box flex={1}>
        <CustomInput
          label={t('marketplace.explore.filterSheet.min')}
          placeholder={t('marketplace.explore.filterSheet.any')}
          value={min}
          onChangeText={changeMin}
          keyboardType="number-pad"
          maxLength={maxLength}
          editable={editable}
          returnKeyType="done"
        />
      </Box>
      <Box flex={1}>
        <CustomInput
          label={t('marketplace.explore.filterSheet.max')}
          placeholder={t('marketplace.explore.filterSheet.any')}
          value={max}
          onChangeText={changeMax}
          keyboardType="number-pad"
          maxLength={maxLength}
          editable={editable}
          returnKeyType="done"
        />
      </Box>
    </Box>
  );
});

const FlagBox = memo<{
  field: ExploreDraftFlag;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (field: ExploreDraftFlag, value: boolean) => void;
}>(({ field, label, checked, disabled, onChange }) => {
  const change = useCallback((value: boolean) => onChange(field, value), [field, onChange]);
  return <Checkbox label={label} checked={checked} onChange={change} disabled={disabled} />;
});

/**
 * Explore filters on a working copy: nothing reaches the list until "Show results".
 * Price filters are for verified brands; locked viewers see them 🔒 and tap through
 * to the reason sheet.
 */
const ExploreFilterSheetComponent: React.FC<ExploreFilterSheetProps> = ({
  visible,
  onClose,
  onDismissed,
  filters,
  options,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onApply,
  priceLocked,
  onLocked,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    scroll: { flexGrow: 0, flexShrink: 1 },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing['2xl'] },
  }));
  const { draft, setList, setText, setFlag, toggleDelivery, reset, allNiches, showAllNiches } =
    useExploreFilterDraft(filters, visible);
  const apply = useCallback(() => onApply(draft), [draft, onApply]);

  const niches = options?.niches ?? [];
  const visibleNiches = allNiches ? niches : niches.slice(0, NICHES_PREVIEW);
  const loading = optionsLoading && !options;

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <Box row align="center" justify="space-between" px="lg" pb="sm">
        <Text variant="h4" accessibilityRole="header">
          {t('marketplace.explore.filterSheet.title')}
        </Text>
        <Pressable
          onPress={reset}
          minHeight={sizes.button.md}
          justify="center"
          px="sm"
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.explore.filterSheet.reset')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('marketplace.explore.filterSheet.reset')}
          </Text>
        </Pressable>
      </Box>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {optionsError ? (
          <Notice
            tone="danger"
            message={t('marketplace.explore.filterSheet.optionsFailed')}
            action={{ label: t('common.retry'), onPress: onRetryOptions }}
          />
        ) : null}
        <ListSection
          title={t('marketplace.explore.filterSheet.governorate')}
          field="governorate"
          items={options?.governorates ?? []}
          value={draft.governorate}
          loading={loading}
          onChange={setList}
        />
        <ListSection
          title={t('marketplace.explore.filterSheet.platform')}
          field="platform"
          items={options?.platforms ?? []}
          value={draft.platform}
          loading={loading}
          onChange={setList}
        />
        <Box gap="sm">
          <ListSection
            title={t('marketplace.explore.filterSheet.niche')}
            field="niche"
            items={visibleNiches}
            value={draft.niche}
            loading={loading}
            onChange={setList}
          />
          {!allNiches && niches.length > NICHES_PREVIEW ? (
            <Pressable
              onPress={showAllNiches}
              minHeight={sizes.button.md}
              justify="center"
              alignSelf="flex-start"
              accessibilityRole="button"
            >
              <Text variant="bodyMedium" color={colors.interactive.text}>
                {t('marketplace.explore.filterSheet.moreNiches', { count: niches.length - NICHES_PREVIEW })}
              </Text>
            </Pressable>
          ) : null}
        </Box>
        <ListSection
          title={t('marketplace.explore.filterSheet.tier')}
          field="tier"
          items={options?.tiers ?? []}
          value={draft.tier}
          loading={loading}
          onChange={setList}
        />
        <FormSection title={t('marketplace.explore.filterSheet.followers')}>
          <RangeInputs
            minField="minFollowers"
            maxField="maxFollowers"
            min={draft.minFollowers}
            max={draft.maxFollowers}
            maxLength={FOLLOWERS_MAX_LENGTH}
            editable
            onChange={setText}
          />
        </FormSection>
        <FormSection title={t('marketplace.explore.filterSheet.delivery')}>
          <ChipGroup
            items={options?.deliveryBuckets ?? []}
            value={draft.maxDeliveryDays}
            onChange={toggleDelivery}
            loading={loading}
            accessibilityLabel={t('marketplace.explore.filterSheet.delivery')}
          />
        </FormSection>
        <FormSection title={t('marketplace.explore.filterSheet.more')}>
          <Box gap="sm">
            <FlagBox field="kycVerified" label={t('marketplace.explore.filterSheet.kycVerified')} checked={draft.kycVerified} onChange={setFlag} />
            <FlagBox
              field="followersVerified"
              label={t('marketplace.explore.filterSheet.followersVerified')}
              checked={draft.followersVerified}
              onChange={setFlag}
            />
            <FlagBox field="rush" label={t('marketplace.explore.filterSheet.rush')} checked={draft.rush} onChange={setFlag} />
            <FlagBox field="onSite" label={t('marketplace.explore.filterSheet.onSite')} checked={draft.onSite} onChange={setFlag} />
          </Box>
        </FormSection>
        <Pressable
          onPress={priceLocked ? onLocked : undefined}
          disabled={!priceLocked}
          accessible={priceLocked}
          accessibilityRole={priceLocked ? 'button' : undefined}
          accessibilityLabel={priceLocked ? t('marketplace.explore.filterSheet.priceLockedA11y') : undefined}
        >
          <Box pointerEvents={priceLocked ? 'none' : 'auto'} gap="md">
            <Box row align="center" gap="xs">
              {priceLocked ? <Lock size={sizes.icon.sm} color={colors.icon.secondary} /> : null}
              <Text variant="label">{t('marketplace.explore.filterSheet.price')}</Text>
            </Box>
            <RangeInputs
              minField="priceMin"
              maxField="priceMax"
              min={draft.priceMin}
              max={draft.priceMax}
              maxLength={PRICE_MAX_LENGTH}
              editable={!priceLocked}
              onChange={setText}
            />
            <FlagBox
              field="withinBudget"
              label={t('marketplace.explore.filterSheet.withinBudget')}
              checked={draft.withinBudget}
              disabled={priceLocked}
              onChange={setFlag}
            />
          </Box>
        </Pressable>
      </ScrollView>

      <Box px="lg" pt="md" pb="lg">
        <CustomButton title={t('marketplace.explore.filterSheet.apply')} onPress={apply} fullWidth />
      </Box>
    </BottomSheet>
  );
};

export const ExploreFilterSheet = memo(ExploreFilterSheetComponent);
