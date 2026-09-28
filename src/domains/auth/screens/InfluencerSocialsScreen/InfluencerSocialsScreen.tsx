import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ChipGroup,
  CustomButton,
  FormSection,
  InlineError,
  Layout,
  LayoutFooter,
  Notice,
} from '@/shared/ui';
import { PlatformAccountRow } from '../../components/PlatformAccountRow';
import { PlatformAccountSheet } from '../../components/PlatformAccountSheet';
import { useInfluencerSocialsScreen } from './hooks/useInfluencerSocialsScreen';

export const InfluencerSocialsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    niches,
    onChangeNiches,
    nicheItems,
    maxNiches,
    nichesError,
    platforms,
    platformsError,
    tierLabel,
    canAddPlatform,
    openAdd,
    onEdit,
    onRemove,
    sheet,
    lookupsFailed,
    retryLookups,
    onSubmit,
    isSaving,
    error,
  } = useInfluencerSocialsScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.influencerOnboarding.socials.submit'),
            onPress: onSubmit,
            loading: isSaving,
          }}
        />
      }
    >
      <Box gap="3xl">
        {lookupsFailed ? (
          <Notice
            tone="danger"
            message={t('auth.brandOnboarding.profile.lookupsError')}
            action={{ label: t('common.retry'), onPress: retryLookups }}
          />
        ) : null}

        <FormSection
          title={t('auth.influencerOnboarding.socials.niches')}
          tag={t('auth.influencerOnboarding.socials.nichesCount', {
            count: niches.length,
            max: maxNiches,
          })}
          description={t('auth.influencerOnboarding.socials.nichesHint', { count: maxNiches })}
          error={nichesError}
        >
          <ChipGroup
            multiple
            max={maxNiches}
            items={nicheItems.items}
            value={niches}
            onChange={onChangeNiches}
            loading={nicheItems.isLoading}
            skeletonCount={8}
            accessibilityLabel={t('auth.influencerOnboarding.socials.niches')}
          />
        </FormSection>

        <FormSection
          title={t('auth.influencerOnboarding.socials.platforms')}
          description={t('auth.influencerOnboarding.socials.platformsHint')}
          error={platformsError}
        >
          <Box gap="sm">
            {platforms.map(account => (
              <PlatformAccountRow
                key={account.platform}
                account={account}
                tierLabel={tierLabel(account.followerTier)}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            ))}
          </Box>
          {canAddPlatform ? (
            <CustomButton
              title={t('auth.influencerOnboarding.socials.addPlatform')}
              onPress={openAdd}
              variant="outline"
              leftIcon={<Plus size={sizes.icon.sm} color={colors.interactive.main} />}
              fullWidth
            />
          ) : null}
        </FormSection>

        <InlineError error={error} />
      </Box>

      <PlatformAccountSheet {...sheet} />
    </Layout>
  );
};
