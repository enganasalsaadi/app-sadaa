import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, opacity, resolveHue, useStyles, useTheme } from '@/core/theme';
import type { ViewStyle } from 'react-native';
import { isSocialPlatform } from '@/shared/utils';
import { Box, SocialPlatformIcon, Text } from '@/shared/ui';
import type { ApplicantAccount } from '../../../types/campaign';
import { isVerifiedAccount } from '../../../utils/applicants';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

export interface ApplicantAccountRowProps {
  account: ApplicantAccount;
}

/** One linked account: platform, handle, whether it is verified, and its reach. An unavailable one stays listed, dimmed and labelled. */
const ApplicantAccountRowComponent: React.FC<ApplicantAccountRowProps> = ({ account }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles((): Record<'dim', ViewStyle> => ({ dim: { opacity: opacity.disabled } }));
  const verified = isVerifiedAccount(account);
  const success = resolveHue(colors, 'success');
  const note = !account.available
    ? t('marketplace.campaign.applicants.detail.accounts.unavailable')
    : verified
      ? t('marketplace.campaign.applicants.detail.accounts.verified')
      : null;
  const count =
    account.followerCount !== null ? formatNumber(account.followerCount, COMPACT) : null;

  return (
    <Box
      row
      align="center"
      gap="md"
      p="md"
      borderRadius="md"
      bg={colors.surface.main}
      style={account.available ? undefined : styles.dim}
      accessible
      accessibilityLabel={[account.platform.label, account.username, note, count].filter(Boolean).join('، ')}
    >
      <Box
        width={sizes.avatar.md}
        height={sizes.avatar.md}
        borderRadius="full"
        bg={colors.layout.base}
        align="center"
        justify="center"
      >
        {isSocialPlatform(account.platform.key) ? (
          <SocialPlatformIcon platform={account.platform.key} size={sizes.icon.md} color={colors.text.primary} />
        ) : null}
      </Box>
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
          {account.username}
        </Text>
        <Box row align="center" gap="xs">
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {account.platform.label}
          </Text>
          {note ? (
            <Box row align="center" gap="xs">
              {account.available ? (
                <ShieldCheck size={sizes.icon.xs} color={success.main} strokeWidth={iconStroke.regular} />
              ) : null}
              <Text variant="caption" color={account.available ? success.text : colors.text.secondary}>
                {note}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
      {count ? (
        <Text variant="title" color={colors.text.primary}>
          {count}
        </Text>
      ) : null}
    </Box>
  );
};

export const ApplicantAccountRow = memo(ApplicantAccountRowComponent);
