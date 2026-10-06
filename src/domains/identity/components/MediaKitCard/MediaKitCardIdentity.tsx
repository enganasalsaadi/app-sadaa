import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, CheckCircle2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Avatar, Box, MoneyText, SocialPlatformIcon, Tag, TierBadge, Text } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import { pickPrimaryPlatform, toPriceFrom } from '../../utils/mediaKitCard';

interface MediaKitCardIdentityProps {
  preview: PublicMediaKit;
  /** Already localised from the niche lookup, capped by the caller. */
  nicheLabels: readonly string[];
}

/** What a brand sees first: who, how big, what about, from what price. */
const MediaKitCardIdentityComponent: React.FC<MediaKitCardIdentityProps> = ({
  preview,
  nicheLabels,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const primary = pickPrimaryPlatform(preview.platforms);
  const priceFrom = toPriceFrom(preview.price_from_usd);

  return (
    <Box gap="md">
      <Box row align="center" gap="md">
        <Avatar uri={preview.avatar_url ?? undefined} size={sizes.avatar.lg} />
        <Box flex={1} gap="xs">
          <Box row align="center" gap="xs" wrap>
            <Text variant="title" numberOfLines={1}>
              {preview.display_name ?? preview.slug}
            </Text>
            {preview.is_verified ? (
              <BadgeCheck
                size={sizes.icon.sm}
                color={colors.premium.main}
                accessibilityLabel={t('account.mediaKit.verifiedCreator')}
              />
            ) : null}
          </Box>
          {preview.tier ? <TierBadge tier={preview.tier} size="sm" /> : null}
          {primary ? (
            <Box row align="center" gap="xs">
              <SocialPlatformIcon
                platform={primary.platform}
                size={sizes.icon.xs}
                color={colors.icon.secondary}
              />
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {t('account.mediaKit.followers', {
                  count: formatNumber(primary.follower_count, {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }),
                })}
              </Text>
              {primary.follower_count_verified ? (
                <CheckCircle2
                  size={sizes.icon.xs}
                  color={colors.status.success.main}
                  accessibilityLabel={t('account.mediaKit.verifiedFollowers')}
                />
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>

      {nicheLabels.length > 0 || priceFrom ? (
        <Box row align="center" justify="space-between" gap="md">
          <Box row wrap gap="xs" flex={1}>
            {nicheLabels.map(label => (
              <Tag key={label} label={label} />
            ))}
          </Box>
          {priceFrom ? (
            <Box align="flex-end" gap="xs">
              <Text variant="caption" color={colors.text.secondary}>
                {t('account.mediaKit.priceFrom')}
              </Text>
              <MoneyText value={priceFrom} />
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export const MediaKitCardIdentity = memo(MediaKitCardIdentityComponent);
