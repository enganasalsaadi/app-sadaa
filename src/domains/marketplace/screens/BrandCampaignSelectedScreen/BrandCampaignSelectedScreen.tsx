import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Layout } from '@/shared/ui';
import { SelectedFunded } from './components/SelectedFunded';
import { SelectedUnfunded } from './components/SelectedUnfunded';
import { useBrandCampaignSelectedScreen } from './hooks/useBrandCampaignSelectedScreen';

/**
 * After a pick (PC3.4, approved 2026-10-17): funded, the creator rises into their seat while the
 * escrow holds the price (navy scene); unfunded, the seat is reserved and the payment clock runs
 * beside what the wallet lacks. Either way the next step is the deal or the applicants table.
 */
const BrandCampaignSelectedScreenComponent: React.FC = () => {
  const { colors } = useTheme();
  const vm = useBrandCampaignSelectedScreen();
  const { face } = vm;
  if (!face) return <Layout mode="static">{null}</Layout>;

  // The navy scene paints behind the whole screen (status bar and home indicator included).
  return (
    <Box flex={1} bg={vm.funded ? colors.button.primary.bg : colors.layout.base}>
      <Layout mode="static" padding="none" surface="transparent" statusBar={vm.funded ? 'light' : 'auto'}>
        {vm.funded ? (
          <SelectedFunded
            face={face}
            taken={vm.others}
            seatsOccupied={vm.seatsOccupied}
            seatsTotal={vm.seatsTotal}
            price={vm.price}
            onOpenDeal={vm.openDeal}
            onKeepGoing={vm.keepGoing}
          />
        ) : (
          <SelectedUnfunded
            face={face}
            price={vm.price}
            funding={vm.funding}
            fundingState={vm.fundingState}
            dueAt={vm.dueAt}
            canTopUp={vm.canTopUp}
            onTopUp={vm.topUp}
            onOpenDeal={vm.openDeal}
            onKeepGoing={vm.keepGoing}
          />
        )}
      </Layout>
    </Box>
  );
};

export const BrandCampaignSelectedScreen = memo(BrandCampaignSelectedScreenComponent);
