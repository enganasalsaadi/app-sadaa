import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, KeyValueRow, Notice, StatusPill, Text } from '@/shared/ui';
import type { SocialProofRejectedModel } from '../hooks/useSocialProofScreen';

const ICON_CIRCLE = moderateScale(56);

/** Board 6: the reviewer's reason; a rejection never closes the other routes. */
const SocialProofRejectedComponent: React.FC<{
  rejected: SocialProofRejectedModel;
}> = ({ rejected }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="xl">
      <Card p="lg">
        <Box gap="lg">
          <Box align="center" gap="md">
            <Box
              width={ICON_CIRCLE}
              height={ICON_CIRCLE}
              borderRadius="full"
              bg={colors.status.danger.soft}
              align="center"
              justify="center"
            >
              <XCircle size={sizes.icon.lg} color={colors.status.danger.main} />
            </Box>
            <Text variant="h3" align="center">
              {t('account.verification.social.rejected.title')}
            </Text>
            <StatusPill
              label={rejected.statusLabel}
              tone="danger"
              icon={XCircle}
            />
          </Box>
          {rejected.reason ? (
            <Box
              bg={colors.surface.elevated}
              borderRadius="md"
              px="md"
              py="md"
              gap="xs"
            >
              <Text variant="caption" color={colors.text.tertiary}>
                {t('account.verification.social.rejected.reasonLabel')}
              </Text>
              <Text variant="bodySmall">{rejected.reason}</Text>
            </Box>
          ) : null}
          <Box>
            <KeyValueRow
              label={t('account.verification.social.rejected.page')}
              value={rejected.page}
            />
            {rejected.reviewedAt ? (
              <KeyValueRow
                label={t('account.verification.social.rejected.reviewedAt')}
                value={rejected.reviewedAt}
              />
            ) : null}
          </Box>
        </Box>
      </Card>
      <Notice
        tone="info"
        message={t('account.verification.social.rejected.notice')}
      />
    </Box>
  );
};

export const SocialProofRejected = memo(SocialProofRejectedComponent);
