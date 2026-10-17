import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Notice, Radio, Skeleton, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import type { AccountBlock, AccountChoice } from '../../../utils/campaignApply';
import type { ApplyPlatform, CampaignApplyModel } from '../hooks/useCampaignApply';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const SKELETON_HEIGHT = 72;

export interface ApplyAccountsSectionProps {
  apply: CampaignApplyModel;
}

interface PlatformAccountsProps {
  platform: ApplyPlatform;
  onPick: (platform: string, accountId: string) => void;
  onLink: () => void;
}

const PlatformAccounts = memo<PlatformAccountsProps>(({ platform, onPick, onLink }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const select = useCallback((accountId: string) => onPick(platform.key, accountId), [onPick, platform.key]);
  const noteOf = useCallback(
    ({ account, block }: AccountChoice): string => {
      const blocked = (reason: AccountBlock): string => {
        switch (reason.kind) {
          case 'followers':
            return t('marketplace.campaign.apply.accounts.blocked.followers', { min: formatNumber(reason.min) });
          case 'review':
            return t('marketplace.campaign.apply.accounts.blocked.review');
          case 'rejected':
            return t('marketplace.campaign.apply.accounts.blocked.rejected');
          case 'unavailable':
            return t('marketplace.campaign.apply.accounts.blocked.unavailable');
          default: {
            const _exhaustive: never = reason;
            return _exhaustive;
          }
        }
      };
      if (block) return blocked(block);
      return account.follower_count !== null
        ? t('marketplace.campaign.apply.accounts.followers', { count: formatNumber(account.follower_count, COMPACT) })
        : t('marketplace.campaign.apply.accounts.manual');
    },
    [t],
  );
  return (
    <Box gap="sm">
      <Box row align="center" gap="sm">
        {isSocialPlatform(platform.key) ? (
          <SocialPlatformIcon platform={platform.key} size={sizes.icon.sm} color={colors.text.primary} />
        ) : null}
        <Text variant="bodyMedium" color={colors.text.primary}>
          {platform.label}
        </Text>
      </Box>
      <Card
        p="md"
        borderColor={platform.error ? colors.form.input.borderError : undefined}
        borderWidth={platform.error ? 'md' : undefined}
      >
        <Box gap="xs">
          {platform.choices.length === 0 ? (
            <Box gap="sm" align="flex-start">
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.campaign.apply.accounts.none', { platform: platform.label })}
              </Text>
              <CustomButton
                title={t('marketplace.campaign.apply.accounts.link')}
                onPress={onLink}
                variant="secondary"
                size="sm"
              />
            </Box>
          ) : (
            platform.choices.map(choice => (
              <Radio
                key={choice.account.id}
                value={choice.account.id}
                selected={platform.selectedId === choice.account.id}
                onSelect={select}
                label={`@${choice.account.username}`}
                description={noteOf(choice)}
                disabled={choice.block !== null}
              />
            ))
          )}
        </Box>
      </Card>
      {platform.error ? (
        <Text variant="caption" color={colors.form.input.error} accessibilityRole="alert">
          {platform.error}
        </Text>
      ) : null}
    </Box>
  );
});

/** One account per platform the campaign asks for: the creator's linked ones, the unusable dimmed with their reason. */
const ApplyAccountsSectionComponent: React.FC<ApplyAccountsSectionProps> = ({ apply }) => {
  const { t } = useTranslation();
  const { platforms, platformsLoading, platformsFailed, retryPlatforms, pickAccount, linkPlatform } = apply;
  if (platformsLoading) {
    return (
      <Box gap="md">
        <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="lg" />
        <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="lg" />
      </Box>
    );
  }
  if (platformsFailed) {
    return (
      <Notice
        tone="warning"
        message={t('marketplace.campaign.apply.accounts.loadFailed')}
        action={{ label: t('common.retry'), onPress: retryPlatforms }}
      />
    );
  }
  return (
    <Box gap="lg">
      {platforms.map(platform => (
        <PlatformAccounts key={platform.key} platform={platform} onPick={pickAccount} onLink={linkPlatform} />
      ))}
    </Box>
  );
};

export const ApplyAccountsSection = memo(ApplyAccountsSectionComponent);
