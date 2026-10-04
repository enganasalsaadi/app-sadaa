import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, ChipGroup, ErrorState, FormSection, Layout, LayoutFooter, Text } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { useNichesScreen } from './hooks/useNichesScreen';

/** Detail archetype: pick 1–3 niches, Save is the only action. */
const NichesScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useNichesScreen();
  useHideBottomBar();

  return (
    <>
      <Layout
        header={{ title: t('account.niches.title') }}
        footer={
          vm.isError ? undefined : (
            <LayoutFooter
              primary={{ label: t('common.save'), onPress: vm.onSave, loading: vm.isSaving }}
            />
          )
        }
      >
        {vm.isError ? (
          <ErrorState error={vm.loadError} onRetry={vm.retry} />
        ) : (
          <Box gap="lg">
            <Box row align="center" gap="md">
              <Box flex={1}>
                <Text variant="body" color={colors.text.secondary}>
                  {t('account.niches.subtitle', { count: vm.max })}
                </Text>
              </Box>
              <Text variant="label" color={colors.text.secondary}>
                {t('account.niches.counter', {
                  selected: formatNumber(vm.niches.length),
                  max: formatNumber(vm.max),
                })}
              </Text>
            </Box>
            <FormSection title={t('account.niches.label')} error={vm.error}>
              <ChipGroup
                multiple
                items={vm.items}
                value={vm.niches}
                onChange={vm.onChange}
                max={vm.max}
                loading={vm.isLoading}
                disabled={vm.isSaving}
                accessibilityLabel={t('account.niches.label')}
              />
            </FormSection>
          </Box>
        )}
      </Layout>
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const NichesScreen = memo(NichesScreenComponent);
