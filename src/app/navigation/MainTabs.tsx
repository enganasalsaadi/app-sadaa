import React, { useMemo } from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import {
  Briefcase,
  CircleUser,
  Compass,
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
import { CreatorHomeNavigator, HomeNavigator } from '@/domains/marketplace';
import { selectUserType } from '@/domains/auth';
import { SettingsNavigator } from '@/domains/identity';
import { BrandWalletNavigator, CreatorWalletNavigator } from '@/domains/finance';
import { FloatingBottomBar } from '@/shared/ui';
import { ScrollProvider } from '@/shared/context/ScrollContext';
import { BottomBarProvider } from '@/shared/context/BottomBarContext';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface MainTabDef {
  name: keyof RootTabParamList;
  titleKey: ParseKeys;
  icon: LucideIcon;
  component: React.ComponentType;
}

const CampaignsPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoonTabScreen title={t('tabs.campaigns')} icon={Megaphone} />;
};

const DealsPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoonTabScreen title={t('tabs.deals')} icon={Briefcase} />;
};

const MessagesPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return <ComingSoonTabScreen title={t('tabs.messages')} icon={MessageCircle} />;
};

/** Same route names for both roles; label, icon and root screen differ. */
const BRAND_TABS: readonly MainTabDef[] = [
  { name: 'HomeTab', titleKey: 'tabs.explore', icon: Compass, component: HomeNavigator },
  { name: 'DealsTab', titleKey: 'tabs.campaigns', icon: Megaphone, component: CampaignsPlaceholder },
  { name: 'MessagesTab', titleKey: 'tabs.messages', icon: MessageCircle, component: MessagesPlaceholder },
  { name: 'WalletTab', titleKey: 'tabs.wallet', icon: Wallet, component: BrandWalletNavigator },
  { name: 'SettingsTab', titleKey: 'tabs.account', icon: CircleUser, component: SettingsNavigator },
];

const CREATOR_TABS: readonly MainTabDef[] = [
  { name: 'HomeTab', titleKey: 'tabs.home', icon: House, component: CreatorHomeNavigator },
  { name: 'DealsTab', titleKey: 'tabs.deals', icon: Briefcase, component: DealsPlaceholder },
  { name: 'MessagesTab', titleKey: 'tabs.messages', icon: MessageCircle, component: MessagesPlaceholder },
  { name: 'WalletTab', titleKey: 'tabs.wallet', icon: Wallet, component: CreatorWalletNavigator },
  { name: 'SettingsTab', titleKey: 'tabs.myProfile', icon: IdCard, component: SettingsNavigator },
];

const renderTabBar = (props: BottomTabBarProps) => (
  <FloatingBottomBar {...props} />
);

const buildTabOptions = (
  title: string,
  Icon: LucideIcon,
): BottomTabNavigationOptions => ({
  title,
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
  const tabs = userType === 'influencer' ? CREATOR_TABS : BRAND_TABS;

  const options = useMemo(
    () => tabs.map(tab => buildTabOptions(t(tab.titleKey), tab.icon)),
    [tabs, t],
  );

  return (
    <ScrollProvider>
      <BottomBarProvider>
        <Tab.Navigator
          initialRouteName="HomeTab"
          tabBar={renderTabBar}
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
      </BottomBarProvider>
    </ScrollProvider>
  );
};
