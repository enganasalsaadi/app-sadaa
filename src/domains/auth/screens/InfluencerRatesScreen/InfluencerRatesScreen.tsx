import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, InlineError, Layout, LayoutFooter, Notice, Text } from '@/shared/ui';
import { RatePlatformCard } from '../../components/RatePlatformCard';
import { useInfluencerRatesScreen } from './hooks/useInfluencerRatesScreen';

export const InfluencerRatesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    control,
    groups,
    serviceLabel,
    rootError,
    onSave,
    onSkip,
    isSaving,
    isSkipping,
    isBusy,
    error,
  } = useInfluencerRatesScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          top={
            // Nudge sits right above Skip: the moment the user is about to leave rates empty.
            <Text variant="caption" align="center" color={colors.text.secondary}>
              {t('auth.influencerOnboarding.rates.skipNudge')}
            </Text>
          }
          primary={{
            label: t('auth.influencerOnboarding.rates.submit'),
            onPress: onSave,
            loading: isSaving,
            disabled: isBusy && !isSaving,
          }}
          secondary={{
            label: t('auth.influencerOnboarding.rates.skip'),
            onPress: onSkip,
            loading: isSkipping,
            disabled: isBusy && !isSkipping,
          }}
        />
      }
    >
      <Box gap="2xl">
        <Notice
          tone="info"
          icon={TrendingUp}
          message={t('auth.influencerOnboarding.rates.hint')}
        />

        {groups.map(group => (
          <RatePlatformCard
            key={group.platform}
            control={control}
            platform={group.platform}
            username={group.username}
            rows={group.rows}
            serviceLabel={serviceLabel}
          />
        ))}

        {rootError ? (
          <Text variant="bodySmall" color={colors.status.danger.text}>
            {rootError}
          </Text>
        ) : null}
        <InlineError error={error} />
      </Box>
    </Layout>
  );
};
