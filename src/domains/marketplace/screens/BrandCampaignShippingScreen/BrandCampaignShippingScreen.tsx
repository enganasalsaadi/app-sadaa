import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye, PackageCheck, Truck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, EmptyState, ErrorState, Layout, Notice, StaggerIn, Text } from '@/shared/ui';
import { ShippingBulkBar } from './components/ShippingBulkBar';
import { ShippingDock } from './components/ShippingDock';
import { ShippingParcel } from './components/ShippingParcel';
import { ShippingSkeleton } from './components/ShippingSkeleton';
import { ShippingTotals } from './components/ShippingTotals';
import { useBrandCampaignShippingScreen } from './hooks/useBrandCampaignShippingScreen';

/**
 * The brand's shipping manifest (`GET /{id}/shipping`, approved design 2026-10-17): a loading list.
 * Tick the parcels that go, fill courier and number, hold to send them all; the server answers per
 * row, so shipped parcels are stamped and failed ones rise with the server's words and stay
 * editable. Creators' addresses are hidden until tapped, under a fixed line saying viewing is logged.
 */
const BrandCampaignShippingScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useBrandCampaignShippingScreen();
  const { board } = vm;

  if (vm.isLoading) return <ShippingSkeleton />;
  if (!board) {
    return (
      <Layout mode="static" header={{ title: t('marketplace.campaign.shipping.title') }}>
        {vm.noShipping ? (
          <EmptyState
            icon={Truck}
            title={t('marketplace.campaign.shipping.empty.noShipping.title')}
            message={t('marketplace.campaign.shipping.empty.noShipping.message')}
          />
        ) : (
          <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.campaign.shipping.loadFailed')} />
        )}
      </Layout>
    );
  }

  const parcels = t('marketplace.campaign.shipping.parcels', { count: vm.parcels.length });
  const subtitle = vm.campaignTitle
    ? t('marketplace.campaign.shipping.subtitle', { title: vm.campaignTitle, parcels })
    : parcels;

  return (
    <Layout
      headerBehavior="fixed"
      header={{ title: t('marketplace.campaign.shipping.title'), subtitle }}
      footerBehavior="docked"
      footer={<ShippingDock control={vm.control} parcels={vm.parcels} onSend={vm.onSend} />}
      scrollProps={{
        refreshControl: <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.brand.main} />,
      }}
    >
      <StaggerIn gap="lg">
        <Box gap="md">
          <ShippingTotals totals={vm.totals} />
          <Box row align="center" gap="sm">
            <Eye size={sizes.icon.xs} color={colors.text.tertiary} />
            <Box flex={1}>
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.campaign.shipping.viewLog')}
              </Text>
            </Box>
          </Box>
        </Box>
        {vm.batchError ? (
          <Notice
            tone="danger"
            title={t('marketplace.campaign.shipping.batchError.title')}
            message={t('marketplace.campaign.shipping.batchError.message', { message: vm.batchError })}
          />
        ) : null}
        {vm.parcels.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title={t('marketplace.campaign.shipping.empty.idle.title')}
            message={t('marketplace.campaign.shipping.empty.idle.message')}
          />
        ) : null}
        {vm.anyShippable ? (
          <ShippingBulkBar
            control={vm.control}
            parcels={vm.parcels}
            courierItems={vm.bulkItems}
            onSelectAll={vm.setAllSelected}
            onCourier={vm.setCourierForAll}
          />
        ) : null}
        {vm.parcels.length > 0 ? (
          <Box gap="md">
            {vm.parcels.map(parcel => (
              <ShippingParcel
                key={parcel.row.dealId}
                parcel={parcel}
                control={vm.control}
                courierItems={vm.courierItems}
                revealed={vm.revealed.includes(parcel.row.dealId)}
                onToggle={vm.toggleSelected}
                onToggleReveal={vm.toggleReveal}
                onCopyAddress={vm.copyAddress}
              />
            ))}
          </Box>
        ) : null}
      </StaggerIn>
    </Layout>
  );
};

export const BrandCampaignShippingScreen = memo(BrandCampaignShippingScreenComponent);
