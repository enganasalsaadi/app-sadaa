import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import {
  Briefcase,
  CircleUser,
  House,
  IdCard,
  Megaphone,
  MessageCircle,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { iconStroke } from '@/core/theme';
import type { RootTabParamList } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { ComingSoonTabScreen } from '@/app/screens';
import {
  BrandDealsNavigator,
  BrandHomeNavigator,
  CreatorDealsNavigator,
  CreatorHomeNavigator,
  useBrandDealsBadge,
  useCreatorDealsBadge,
} from '@/domains/marketplace';
import { selectUserType } from '@/domains/auth';
import { SettingsNavigator } from '@/domains/identity';
import { BrandWalletNavigator, CreatorWalletNavigator } from '@/domains/finance';
import { MainTabBar } from '@/shared/ui';
import { ScrollProvider } from '@/shared/context/ScrollContext';
import { isOnTabRoot } from './tabRoot';
import { TabScreenInsets } from './TabScreenInsets';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface MainTabDef {
  name: keyof RootTabParamList;
  titleKey: ParseKeys;
  icon: LucideIcon;
  component: React.ComponentType;
}

const MessagesPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoonTabScreen title={t('tabs.messages')} icon={MessageCircle} />;
};

/** Same route names for both roles; label, icon and root screen differ. */
const BRAND_TABS: readonly MainTabDef[] = [
  { name: 'HomeTab', titleKey: 'tabs.home', icon: House, component: BrandHomeNavigator },
  { name: 'DealsTab', titleKey: 'tabs.campaigns', icon: Megaphone, component: BrandDealsNavigator },
  { name: 'MessagesTab', titleKey: 'tabs.messages', icon: MessageCircle, component: MessagesPlaceholder },
  { name: 'WalletTab', titleKey: 'tabs.wallet', icon: Wallet, component: BrandWalletNavigator },
  { name: 'SettingsTab', titleKey: 'tabs.account', icon: CircleUser, component: SettingsNavigator },
];

const CREATOR_TABS: readonly MainTabDef[] = [
  { name: 'HomeTab', titleKey: 'tabs.home', icon: House, component: CreatorHomeNavigator },
  { name: 'DealsTab', titleKey: 'tabs.deals', icon: Briefcase, component: CreatorDealsNavigator },
  { name: 'MessagesTab', titleKey: 'tabs.messages', icon: MessageCircle, component: MessagesPlaceholder },
  { name: 'WalletTab', titleKey: 'tabs.wallet', icon: Wallet, component: CreatorWalletNavigator },
  { name: 'SettingsTab', titleKey: 'tabs.myProfile', icon: IdCard, component: SettingsNavigator },
];

// Same docked bar for both roles; it shows only while the focused tab sits on its main screen.
const renderTabBar = (props: BottomTabBarProps) => {
  const focused = props.state.routes[props.state.index];
  return <MainTabBar {...props} visible={focused ? isOnTabRoot(focused) : true} />;
};

const renderTabScreen = ({
  route,
  children,
}: {
  route: RouteProp<RootTabParamList>;
  children: React.ReactElement;
}) => <TabScreenInsets docked={isOnTabRoot(route)}>{children}</TabScreenInsets>;

const buildTabOptions = (
  title: string,
  Icon: LucideIcon,
  badge?: { count: number; label: string },
): BottomTabNavigationOptions => ({
  title,
  tabBarBadge: badge?.count,
  tabBarAccessibilityLabel: badge?.label,
  tabBarIcon: ({ focused, color, size }) => (
    <Icon
      size={size}
      color={color}
      strokeWidth={focused ? iconStroke.bold : iconStroke.regular}
    />
  ),
});

/** Role tab set (rule 01: role branches here, never inside screens). */
export const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const userType = useAppSelector(selectUserType);
  const isCreator = userType === 'influencer';
  const tabs = isCreator ? CREATOR_TABS : BRAND_TABS;
  // Deals waiting on the viewer (0 hides it): brand from the cached Brand Home, creator from its
  // own summary read.
  const brandDealsBadge = useBrandDealsBadge();
  const creatorDealsBadge = useCreatorDealsBadge(isCreator);
  const dealsBadge = isCreator ? creatorDealsBadge : brandDealsBadge;

  const options = useMemo(
    () =>
      tabs.map(tab => {
        const title = t(tab.titleKey);
        const badge =
          tab.name === 'DealsTab' && dealsBadge > 0
            ? { count: dealsBadge, label: t('tabs.waiting', { title, count: dealsBadge }) }
            : undefined;
        return buildTabOptions(title, tab.icon, badge);
      }),
    [dealsBadge, tabs, t],
  );

  return (
    <ScrollProvider>
      <Tab.Navigator
        initialRouteName="HomeTab"
        tabBar={renderTabBar}
        screenLayout={renderTabScreen}
        // `animation: 'fade'` here races freezeOnBlur (rn-screens 4.24 + React 19):
        // the cross-fade can finish before the thawed tab commits its first frame,
        // leaving an intermittent blank screen. Instant switch avoids the race.
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        {tabs.map((tab, index) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={options[index]}
          />
        ))}
      </Tab.Navigator>
    </ScrollProvider>
  );
};
