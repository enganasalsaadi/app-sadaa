import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  ErrorState,
  InlineError,
  Layout,
  LayoutFooter,
  Notice,
  Skeleton,
  Text,
} from '@/shared/ui';
import { RatePlatformCard } from '../../components/RatePlatformCard';
import { useInfluencerRatesScreen } from './hooks/useInfluencerRatesScreen';

const SKELETON_CARD_HEIGHT = moderateScale(168);
const SKELETON_CARDS = ['a', 'b'] as const;

const RatesSkeleton = memo(() => (
  <Box gap="2xl">
    {SKELETON_CARDS.map(key => (
      <Skeleton key={key} width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
    ))}
  </Box>
));

export const InfluencerRatesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    control,
    groups,
    catalog,
    rootError,
    onSave,
    onSkip,
    isSaving,
    isSkipping,
    isBusy,
    error,
  } = useInfluencerRatesScreen();

  const renderGroups = () => {
    if (catalog.isError) {
      return <ErrorState error={catalog.error} onRetry={catalog.retry} retrying={catalog.isRetrying} />;
    }
    if (!groups) return <RatesSkeleton />;
    return groups.map(group => (
      <RatePlatformCard
        key={group.key}
        control={control}
        platform={group.platform}
        title={group.label ?? t('account.rates.inPerson')}
        subtitle={group.username ? `@${group.username}` : undefined}
        rows={group.rows}
      />
    ));
  };

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
            disabled: !groups || (isBusy && !isSaving),
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

        {renderGroups()}

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
