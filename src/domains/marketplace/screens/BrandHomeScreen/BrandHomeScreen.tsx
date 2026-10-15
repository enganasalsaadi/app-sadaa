import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { Box, Layout } from '@/shared/ui';
import { useBrandHomeScreen } from './hooks/useBrandHomeScreen';
import { CategoryChips } from './components/CategoryChips';
import { HomeDeals } from './components/HomeDeals';
import { HomeHeadline } from './components/HomeHeadline';
import { HomeIsland } from './components/HomeIsland';
import { HomeRails } from './components/HomeRails';
import { HomeTopBar } from './components/HomeTopBar';
import { SearchEntry } from './components/SearchEntry';
import { SupportLine } from './components/SupportLine';
import { WalletLine } from './components/WalletLine';

/**
 * Brand Home «Spotlight» (approved 2026-10-11): greeting row, a quiet wallet line, the server's
 * blocker, then «your deals» (approved 2026-10-15: the next step on top, the rest on their
 * trackers); one big question, search and category shortcuts; then the rails, each in its own
 * shape, led by the swipeable story deck of creators near you. Search, chips, filters and
 * "See all" open Explore; ❤️ opens the Shortlist.
 */
const BrandHomeScreenComponent: React.FC = () => {
  const vm = useBrandHomeScreen();

  return (
    <Layout
      padding="none"
      scrollProps={{
        refreshControl: <RefreshControl refreshing={vm.refreshing} onRefresh={vm.onRefresh} />,
      }}
    >
      <Box pb="7xl">
        <HomeTopBar
          hero={vm.hero}
          unread={vm.unreadNotifications}
          onOpenProfile={vm.openProfile}
          onOpenShortlist={vm.openShortlist}
          onOpenNotifications={vm.openNotifications}
        />
        <Box mt="xs">
          <WalletLine
            hero={vm.hero}
            hidden={vm.hidden}
            onOpenWallet={vm.openWallet}
            onTopUp={vm.openTopUp}
          />
        </Box>
        {vm.island ? (
          <Box mt="xl">
            <HomeIsland key={vm.island.key} island={vm.island} />
          </Box>
        ) : null}
        {vm.deals.kind === 'hidden' ? null : (
          <Box mt="2xl">
            <HomeDeals
              deals={vm.deals}
              openDeal={vm.openDeal}
              openDeals={vm.openDeals}
              browseAll={vm.browseAll}
            />
          </Box>
        )}
        <Box mt="4xl" gap="lg">
          <HomeHeadline />
          <SearchEntry onOpenSearch={vm.openSearch} onOpenFilters={vm.browseAll} />
          <CategoryChips
            categories={vm.categories}
            onOpenCategory={vm.openCategory}
            onBrowseAll={vm.browseAll}
          />
        </Box>
        <Box mt="4xl">
          <HomeRails
            status={vm.status}
            rails={vm.rails}
            retry={vm.retry}
            openCreator={vm.openCreator}
            toggleShortlist={vm.toggleShortlist}
            openRail={vm.openRail}
            browseAll={vm.browseAll}
          />
        </Box>
        {vm.hasSupport ? (
          <Box mt="4xl">
            <SupportLine onContact={vm.contactSupport} />
          </Box>
        ) : null}
      </Box>
    </Layout>
  );
};

export const BrandHomeScreen = memo(BrandHomeScreenComponent);
