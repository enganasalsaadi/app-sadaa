import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Building2, LogOut, UserRoundPen } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, Layout, Notice, StaggerIn } from '@/shared/ui';
import { DeleteAccountSheet } from '@/domains/auth';
import type { ProfileSectionKey } from '../../constants/profileSections';
import { useProfileScreen, type ProfileScreenModel } from './hooks/useProfileScreen';
import { ProfileHero } from './components/ProfileHero';
import { ProfileBar } from './components/ProfileBar';
import { KycRejectedStrip } from './components/KycRejectedStrip';
import { MissingStepsRail } from './components/MissingStepsRail';
import { PushCard } from './components/PushCard';
import { PlatformsCarousel } from './components/PlatformsCarousel';
import { CreatorToolsBento } from './components/CreatorToolsBento';
import { CompanyInfoCard } from './components/CompanyInfoCard';
import { BrandVisibilityCard } from './components/BrandVisibilityCard';
import { SettingsDrawer } from './components/SettingsDrawer';
import { AccountFooter } from './components/AccountFooter';

interface SectionProps {
  section: ProfileSectionKey;
  vm: ProfileScreenModel;
}

/** Rails run edge to edge; every other block sits in the screen gutter. */
const EDGE_TO_EDGE: ReadonlySet<ProfileSectionKey> = new Set(['completion', 'platforms']);

/** One block per registry key. */
const ProfileSection: React.FC<SectionProps> = ({ section, vm }) => {
  const { t } = useTranslation();
  switch (section) {
    case 'kycRejected':
      return <KycRejectedStrip reason={vm.kyc.rejectionReason} isBrand={vm.isBrand} onReupload={vm.openKyc} />;
    case 'completion':
      return <MissingStepsRail steps={vm.tickets} onStepPress={vm.onStepPress} />;
    case 'push':
      return <PushCard permission={vm.push.permission} isBrand={vm.isBrand} onEnable={vm.push.enable} />;
    case 'detailsError':
      return (
        <Notice
          tone="danger"
          message={t('account.profile.detailsError')}
          action={{ label: t('common.retry'), onPress: vm.details.retry }}
        />
      );
    case 'platforms':
      return <PlatformsCarousel platforms={vm.platforms} isLoading={vm.details.isLoading} onOpen={vm.openPlatforms} />;
    case 'creatorTools':
      return (
        <CreatorToolsBento
          rates={vm.rates}
          mediaKit={vm.mediaKit}
          nicheLabels={vm.nicheLabels}
          showNiches={!vm.details.isError}
          nichesLoading={vm.details.isLoading}
          onRates={vm.openRates}
          onPayouts={vm.openPayoutMethods}
          onMediaKit={vm.openMediaKitSettings}
          onNiches={vm.openNiches}
        />
      );
    case 'company':
      return <CompanyInfoCard company={vm.company} isLoading={vm.details.isLoading} onEdit={vm.openEditInfo} />;
    case 'brandVisibility':
      return (
        <BrandVisibilityCard model={vm.brandVisibility} brandName={vm.hero.displayName} logoUrl={vm.hero.avatarUrl} />
      );
    case 'settings':
      return (
        <SettingsDrawer
          themeMode={vm.themeMode}
          pushEnabled={vm.push.permission === 'enabled'}
          languageLabel={vm.languageLabel}
          onThemeModeChange={vm.changeThemeMode}
          onLanguage={vm.openLanguage}
          onPassword={vm.openPassword}
          onDealGuide={vm.openDealGuide}
          onTerms={vm.openTerms}
          onPrivacy={vm.openPrivacy}
          onDevShowcase={vm.openDevShowcase}
        />
      );
    case 'account':
      return (
        <AccountFooter appVersion={vm.appVersion} onLogout={vm.openLogoutSheet} onDeleteAccount={vm.openDeleteSheet} />
      );
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
};

/**
 * Profile / account tab root, one screen for both roles (blocks per role in `PROFILE_SECTIONS`).
 * Navy hero with the completion orbit (the body slides over it as a sheet), then what is still missing, then the role's
 * own blocks, settings and the account footer.
 */
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
        heroBackdrop="brandGlow"
        heroBehavior="parallax"
        header={{
          title: vm.hero.displayName || vm.hero.title,
          variant: 'brand',
          showBackButton: false,
          leading: <ProfileBar hero={vm.hero} />,
          actions: [
            {
              icon: Bell,
              accessibilityLabel: vm.unreadNotifications
                ? t('notifications.inbox.openUnread', { count: vm.unreadNotifications })
                : t('notifications.inbox.title'),
              badge: vm.unreadNotifications,
              onPress: vm.openNotifications,
              glass: true,
            },
            {
              icon: vm.isBrand ? Building2 : UserRoundPen,
              accessibilityLabel: t(vm.isBrand ? 'account.companyInfo.title' : 'account.personalInfo.title'),
              onPress: vm.openEditInfo,
              glass: true,
            },
          ],
        }}
        hero={
          <ProfileHero
            hero={vm.hero}
            onChangePhoto={vm.changePhoto}
            onStepPress={vm.onStepPress}
            onOpenKyc={vm.kyc.canSubmit ? vm.openKyc : undefined}
          />
        }
        scrollProps={{
          refreshControl: (
            <RefreshControl
              refreshing={vm.refreshing}
              onRefresh={vm.onRefresh}
              // The spinner sits over the navy backdrop.
              tintColor={colors.text.onBrand}
            />
          ),
        }}
      >
        <Box pt="2xl" pb="5xl">
          <StaggerIn gap="3xl">
            {vm.sections.map(section =>
              EDGE_TO_EDGE.has(section) ? (
                <ProfileSection key={section} section={section} vm={vm} />
              ) : (
                <Box key={section} px="xl">
                  <ProfileSection section={section} vm={vm} />
                </Box>
              ),
            )}
          </StaggerIn>
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
      <DeleteAccountSheet visible={vm.deleteSheetVisible} onClose={vm.closeDeleteSheet} onOpenWallet={vm.openWallet} />
    </>
  );
};

export const ProfileScreen = memo(ProfileScreenComponent);
