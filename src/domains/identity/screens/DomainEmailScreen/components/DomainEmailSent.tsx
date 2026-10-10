import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Mail, MailWarning } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, KeyValueRow, Notice, StatusPill, Text } from '@/shared/ui';
import type { DomainEmailSentModel } from '../hooks/useDomainEmailScreen';

const ICON_CIRCLE = moderateScale(56);

/** Board 8: "check your inbox" with the link's lifetime, or the expired variant. */
const DomainEmailSentComponent: React.FC<{
  sent: DomainEmailSentModel;
  expired: boolean;
}> = ({ sent, expired }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = expired ? colors.status.warning : colors.interactive;
  const Icon = expired ? MailWarning : Mail;
  return (
    <Box gap="xl">
      <Box align="center" gap="md" pt="sm">
        <Box
          width={ICON_CIRCLE}
          height={ICON_CIRCLE}
          borderRadius="full"
          bg={hue.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.lg} color={hue.main} />
        </Box>
        <Text variant="h2" align="center">
          {sent.title}
        </Text>
        <Text variant="body" align="center" color={colors.text.secondary}>
          {sent.body}
        </Text>
      </Box>
      <Card p="lg">
        <KeyValueRow
          label={t('account.verification.domain.sent.domain')}
          value={sent.domain}
        />
        <KeyValueRow
          label={t('account.verification.domain.sent.email')}
          value={sent.email}
        />
        <KeyValueRow
          label={t('account.verification.domain.sent.expiry')}
          value={
            <StatusPill
              label={sent.expiryLabel}
              tone={expired ? 'danger' : 'warning'}
              icon={Clock}
            />
          }
        />
      </Card>
      {expired ? null : (
        <Notice tone="info" message={t('account.verification.domain.sent.notice')} />
      )}
    </Box>
  );
};

export const DomainEmailSent = memo(DomainEmailSentComponent);
