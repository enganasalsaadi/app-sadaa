import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Building2, LogOut, UserRoundPen } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, Layout } from '@/shared/ui';
import { DeleteAccountSheet } from '@/domains/auth';
import type { ProfileSectionKey } from '../../constants/profileSections';
import { useProfileScreen, type ProfileScreenModel } from './hooks/useProfileScreen';
import { ProfileHero } from './components/ProfileHero';
import { MissingStepsRail } from './components/MissingStepsRail';
import { PushCard } from './components/PushCard';
import { KycCard } from '../../components/KycCard';
import { PlatformsSummaryCard } from './components/PlatformsSummaryCard';
import { NichesCard } from './components/NichesCard';
import { CompanyInfoCard } from './components/CompanyInfoCard';
import { SettingsGrid } from './components/SettingsGrid';
import { AccountFooter } from './components/AccountFooter';

interface SectionProps {
  section: ProfileSectionKey;
  vm: ProfileScreenModel;
}

/** One card per registry key; the rail runs edge to edge, the rest sit in the screen gutter. */
const ProfileSection: React.FC<SectionProps> = ({ section, vm }) => {
  switch (section) {
    case 'completion':
      return <MissingStepsRail steps={vm.missingSteps} onStepPress={vm.onStepPress} />;
    case 'push':
      return <PushCard permission={vm.push.permission} onEnable={vm.push.enable} />;
    case 'kyc':
      return (
        <KycCard
          kyc={vm.kyc}
          userType={vm.userType}
          onOpen={vm.kyc.canSubmit ? vm.openKyc : undefined}
        />
      );
    case 'platforms':
      return (
        <PlatformsSummaryCard
          summary={vm.platformsSummary}
          details={vm.details}
          onPress={vm.openPlatforms}
        />
      );
    case 'niches':
      return (
        <NichesCard
          labels={vm.nicheLabels}
          isLoading={vm.details.isLoading}
          onPress={vm.openNiches}
        />
      );
    case 'company':
      return (
        <CompanyInfoCard
          company={vm.company}
          isLoading={vm.details.isLoading}
          onPress={vm.openEditInfo}
        />
      );
    case 'settings':
      return (
        <SettingsGrid
          themeMode={vm.themeMode}
          onThemeModeChange={vm.changeThemeMode}
          onPassword={vm.openPassword}
          onLanguage={vm.openLanguage}
          onTerms={vm.openTerms}
          onPrivacy={vm.openPrivacy}
          onDevShowcase={vm.openDevShowcase}
        />
      );
    case 'account':
      return (
        <AccountFooter
          appVersion={vm.appVersion}
          onLogout={vm.openLogoutSheet}
          onDeleteAccount={vm.openDeleteSheet}
        />
      );
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
};

const ProfileScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useProfileScreen();

  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        header={{
          title: vm.hero.displayName || t('account.profile.title'),
          variant: 'brand',
          showBackButton: false,
          actions: [
            {
              icon: Bell,
              accessibilityLabel: vm.unreadNotifications
                ? t('notifications.inbox.openUnread', { count: vm.unreadNotifications })
                : t('notifications.inbox.title'),
              badge: vm.unreadNotifications,
              onPress: vm.openNotifications,
            },
            {
              icon: vm.isBrand ? Building2 : UserRoundPen,
              accessibilityLabel: t(
                vm.isBrand ? 'account.companyInfo.title' : 'account.personalInfo.title',
              ),
              onPress: vm.openEditInfo,
            },
          ],
        }}
        hero={<ProfileHero hero={vm.hero} onChangePhoto={vm.changePhoto} />}
        scrollProps={{
          refreshControl: (
            <RefreshControl
              refreshing={vm.refreshing}
              onRefresh={vm.onRefresh}
              tintColor={colors.interactive.main}
            />
          ),
        }}
      >
        <Box gap="2xl" pt="xl" pb="5xl">
          {vm.sections.map(section =>
            section === 'completion' ? (
              <ProfileSection key={section} section={section} vm={vm} />
            ) : (
              <Box key={section} px="xl">
                <ProfileSection section={section} vm={vm} />
              </Box>
            ),
          )}
        </Box>
      </Layout>

      <ConfirmSheet
        visible={vm.logoutSheetVisible}
        onClose={vm.closeLogoutSheet}
        icon={<LogOut size={sizes.icon.lg} color={colors.text.secondary} />}
        title={t('account.profile.logoutConfirmTitle')}
        body={t('account.profile.logoutConfirmSubtitle')}
        confirmLabel={t('account.profile.logoutConfirmBtn')}
        onConfirm={vm.handleLogout}
        confirmLoading={vm.isLoggingOut}
        cancelLabel={t('common.cancel')}
      />
      <DeleteAccountSheet visible={vm.deleteSheetVisible} onClose={vm.closeDeleteSheet} />
    </>
  );
};

export const ProfileScreen = memo(ProfileScreenComponent);
