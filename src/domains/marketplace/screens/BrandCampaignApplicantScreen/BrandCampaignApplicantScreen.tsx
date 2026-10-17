import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react-native';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box, Card, ConfirmSheet, CustomButton, ErrorState, Layout, MoneyText, StaggerIn, StatusPill, Text } from '@/shared/ui';
import { ApplicantSelectSheet } from '../../components/ApplicantSelectSheet';
import { formatCampaignDay } from '../../utils/campaignSchedule';
import { ApplicantAccountRow } from './components/ApplicantAccountRow';
import { ApplicantDock } from './components/ApplicantDock';
import { ApplicantHero } from './components/ApplicantHero';
import { ApplicantSkeleton } from './components/ApplicantSkeleton';
import { ApplicantStateNotice } from './components/ApplicantStateNotice';
import { ApplicantStats } from './components/ApplicantStats';
import { useBrandCampaignApplicantScreen } from './hooks/useBrandCampaignApplicantScreen';

/**
 * One applicant, in the «recruiting table» language (PC3.2): their photo with the time left to
 * decide, the numbers a brand weighs, their note as a quote, what they ask or bid, and every linked
 * account. The body slides over the photo like the campaign page. The dock holds select (PC3.4,
 * press-and-hold on its sheet), shortlist and reject (the latter asks first); the media kit is one tap away.
 */
const BrandCampaignApplicantScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useBrandCampaignApplicantScreen();
  const { applicant } = vm;
  const styles = useStyles(
    ({ radii, spacing }): Record<'sheet' | 'quote', ViewStyle> => ({
      sheet: {
        marginTop: -spacing['2xl'],
        borderTopStartRadius: radii.xl,
        borderTopEndRadius: radii.xl,
        backgroundColor: colors.layout.base,
      },
      quote: { borderStartWidth: 3, borderStartColor: colors.brand.main, paddingStart: spacing.md },
    }),
    [colors.layout.base, colors.brand.main],
  );

  if (vm.isLoading) return <ApplicantSkeleton />;
  if (!applicant) {
    return (
      <Layout mode="static" header={{ title: t('marketplace.campaign.applicants.detail.title') }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.campaign.applicants.detail.loadFailed')} />
      </Layout>
    );
  }

  const { creator, price, pitch, status } = applicant;
  const showDock = vm.canSelect || vm.canShortlist || vm.canReject;
  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBehavior="parallax"
        header={{ title: creator.displayName, variant: 'brand' }}
        footerBehavior="docked"
        footer={
          showDock ? (
            <ApplicantDock
              canSelect={vm.canSelect}
              canShortlist={vm.canShortlist}
              canReject={vm.canReject}
              busy={vm.isDeciding}
              onSelect={vm.select.open}
              onShortlist={vm.shortlist}
              onReject={vm.reject.open}
            />
          ) : undefined
        }
        hero={<ApplicantHero applicant={applicant} />}
        scrollProps={{
          refreshControl: (
            <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.text.onBrand} />
          ),
        }}
      >
        <Box style={styles.sheet} px="xl" pt="xl" pb="5xl">
          <StaggerIn gap="lg">
            <ApplicantStateNotice status={status.key} />
            <ApplicantStats applicant={applicant} />
            <Card>
              <Box gap="sm">
                <Text variant="caption" color={colors.text.secondary}>
                  {t('marketplace.campaign.applicants.detail.pitch')} ·{' '}
                  {t('marketplace.campaign.applicants.detail.appliedOn', { date: formatCampaignDay(applicant.appliedAt) })}
                </Text>
                <Box style={styles.quote}>
                  <Text variant="body" color={pitch ? colors.text.primary : colors.text.secondary}>
                    {pitch ?? t('marketplace.campaign.applicants.detail.pitchEmpty')}
                  </Text>
                </Box>
              </Box>
            </Card>
            <Card>
              <Box row align="center" justify="space-between" gap="md">
                <Box>
                  <Text variant="caption" color={colors.text.secondary}>
                    {t(
                      price.isBid
                        ? 'marketplace.campaign.applicants.detail.price.bid'
                        : 'marketplace.campaign.applicants.detail.price.fixed',
                    )}
                  </Text>
                  <MoneyText value={price.gross} size="title" tone="money" />
                </Box>
                {price.isBid ? (
                  <StatusPill label={t('marketplace.campaign.applicants.card.bid')} tone="info" size="sm" />
                ) : null}
              </Box>
            </Card>
            <Box gap="sm">
              <Text variant="title" color={colors.text.primary}>
                {t('marketplace.campaign.applicants.detail.accounts.title')}
              </Text>
              {applicant.accounts.map(account => (
                <ApplicantAccountRow key={`${account.platform.key}:${account.username}`} account={account} />
              ))}
            </Box>
            <CustomButton
              title={t('marketplace.campaign.applicants.detail.mediaKit')}
              variant="secondary"
              fullWidth
              leftIcon={<ExternalLink size={sizes.icon.sm} color={colors.interactive.main} strokeWidth={iconStroke.regular} />}
              onPress={vm.openMediaKit}
            />
            {applicant.deal ? (
              <CustomButton
                title={t('marketplace.campaign.applicants.detail.openDeal')}
                fullWidth
                onPress={vm.openDeal}
              />
            ) : null}
          </StaggerIn>
        </Box>
      </Layout>
      <ApplicantSelectSheet flow={vm.select.flow} />
      <ConfirmSheet
        visible={vm.reject.visible}
        onClose={vm.reject.close}
        title={t('marketplace.campaign.applicants.detail.rejectSheet.title', { name: creator.displayName })}
        body={t('marketplace.campaign.applicants.detail.rejectSheet.body')}
        confirmLabel={t('marketplace.campaign.applicants.detail.rejectSheet.confirm')}
        confirmVariant="danger"
        confirmLoading={vm.isDeciding}
        onConfirm={vm.reject.confirm}
        cancelLabel={t('marketplace.campaign.applicants.detail.rejectSheet.keep')}
      />
    </>
  );
};

export const BrandCampaignApplicantScreen = memo(BrandCampaignApplicantScreenComponent);
