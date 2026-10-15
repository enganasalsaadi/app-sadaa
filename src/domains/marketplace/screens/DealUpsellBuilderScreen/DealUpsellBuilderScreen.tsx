import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, PackageSearch } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  EmptyState,
  ErrorState,
  Layout,
  SegmentedControl,
  Skeleton,
  StaggerIn,
  Text,
  type SegmentedOption,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { AddonRow } from '../../components/AddonRow';
import { ServiceCard } from '../../components/ServiceCard';
import { UpsellDock } from './components/UpsellDock';
import { UpsellItemPicker } from './components/UpsellItemPicker';
import { useDealUpsellBuilderScreen, type UpsellMode } from './hooks/useDealUpsellBuilderScreen';

/**
 * The brand adding to a running deal (M8). Two choices only: a new service from the creator's
 * rate cards, or an add-on on a deliverable already in the deal. The price comes from the server
 * as the pick changes; the pinned bar sends it (hold) or tops up the wallet's gap.
 */
const DealUpsellBuilderScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useDealUpsellBuilderScreen();
  useHideBottomBar();
  const title = t('marketplace.deals.upsellBuilder.title');
  const { quote, line, creatorName } = vm;

  if (vm.isLoading) {
    return (
      <Layout header={{ title }}>
        <Box gap="lg">
          <Skeleton width="100%" height={moderateScale(48)} borderRadius="lg" />
          <Skeleton width="100%" height={moderateScale(160)} borderRadius="xl" />
        </Box>
      </Layout>
    );
  }
  if (!vm.deal) {
    return (
      <Layout mode="static" header={{ title }}>
        <ErrorState
          error={vm.loadError}
          onRetry={vm.onRetry}
          title={t('marketplace.deals.upsellBuilder.loadFailed')}
        />
      </Layout>
    );
  }
  if (vm.closed) {
    return (
      <Layout mode="static" header={{ title }}>
        <EmptyState icon={Ban} title={t('marketplace.deals.upsellBuilder.closed')} />
      </Layout>
    );
  }

  const modes: readonly SegmentedOption<UpsellMode>[] = [
    { value: 'deliverable', label: t('marketplace.deals.upsellBuilder.kinds.deliverable') },
    { value: 'addon', label: t('marketplace.deals.upsellBuilder.kinds.addon') },
  ];

  return (
    <Layout header={{ title }} footer={<UpsellDock vm={vm} />}>
      <Box gap="xl">
        <Box gap="sm">
          <SegmentedControl
            options={modes}
            value={vm.mode}
            onChange={vm.setMode}
            accessibilityLabel={title}
          />
          <Text variant="bodySmall" color={colors.text.secondary}>
            {vm.mode === 'deliverable'
              ? t('marketplace.deals.upsellBuilder.kinds.deliverableBody', { name: creatorName })
              : t('marketplace.deals.upsellBuilder.kinds.addonBody')}
          </Text>
        </Box>
        {vm.mode === 'deliverable' ? (
          vm.servicesLoading ? (
            <Skeleton width="100%" height={moderateScale(160)} borderRadius="xl" />
          ) : vm.services.length === 0 ? (
            <Box align="center" gap="sm" p="2xl" borderRadius="xl" bg={colors.surface.main} shadow="card">
              <PackageSearch size={sizes.icon.xl} color={colors.text.tertiary} />
              <Text variant="title" color={colors.text.primary} align="center">
                {t('marketplace.deals.upsellBuilder.noServicesTitle')}
              </Text>
              <Text variant="bodySmall" color={colors.text.secondary} align="center">
                {t('marketplace.deals.upsellBuilder.noServicesBody', { name: creatorName })}
              </Text>
            </Box>
          ) : (
            <Box gap="md">
              <Text variant="label" color={colors.text.secondary}>
                {t('marketplace.deals.upsellBuilder.servicesTitle', { name: creatorName })}
              </Text>
              <StaggerIn gap="md">
                {vm.services.map(service => {
                  const picked = line?.rateCardId === service.rateCardId ? line : undefined;
                  return (
                    <ServiceCard
                      key={service.rateCardId}
                      service={service}
                      line={picked}
                      lineTotal={picked ? (quote?.amount ?? null) : null}
                      maxQuantity={vm.maxQuantity}
                      onToggle={vm.toggleService}
                      onQuantity={vm.setQuantity}
                      onToggleAddon={vm.toggleAddon}
                    />
                  );
                })}
              </StaggerIn>
            </Box>
          )
        ) : (
          <>
            <Box gap="md">
              <Text variant="label" color={colors.text.secondary}>
                {t('marketplace.deals.upsellBuilder.itemsTitle')}
              </Text>
              <UpsellItemPicker items={vm.items} value={vm.itemId} onChange={vm.pickItem} />
            </Box>
            {vm.itemId ? (
              <Box gap="md">
                <Text variant="label" color={colors.text.secondary}>
                  {t('marketplace.deals.upsellBuilder.addonsTitle')}
                </Text>
                {vm.addonChoices.length === 0 ? (
                  <Text variant="bodySmall" color={colors.text.tertiary}>
                    {t('marketplace.deals.upsellBuilder.noAddons')}
                  </Text>
                ) : (
                  <Box gap="sm">
                    {vm.addonChoices.map(addon => (
                      <AddonRow
                        key={addon.type}
                        addon={addon}
                        on={vm.addonType === addon.type}
                        onPress={vm.setAddonType}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}
          </>
        )}
      </Box>
    </Layout>
  );
};

export const DealUpsellBuilderScreen = memo(DealUpsellBuilderScreenComponent);
