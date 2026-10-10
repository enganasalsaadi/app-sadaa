import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, Notice, StatusPill, Text, Timeline } from '@/shared/ui';
import { VerificationCodeCard } from '../../../components/VerificationCodeCard';
import type { SocialProofCodeModel } from '../hooks/useSocialProofScreen';

/** Board 5: the code, what to do with it, and "pending admin review" (never an auto-verify spinner). */
const SocialProofCodeComponent: React.FC<{ code: SocialProofCodeModel }> = ({
  code,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="xl">
      <Box row align="center" justify="space-between" gap="md">
        <StatusPill label={code.statusLabel} tone="warning" icon={Clock} />
        <Text variant="caption" color={colors.text.tertiary}>
          {code.createdAt}
        </Text>
      </Box>
      <VerificationCodeCard
        code={code.code}
        pageUrl={code.pageUrl}
        onCopy={code.onCopy}
      />
      <Card p="lg">
        <Timeline steps={code.steps} variant="steps" />
      </Card>
      <Notice
        tone="info"
        message={code.notice}
        action={
          code.showSupport
            ? {
                label: t('account.verification.social.code.contactSupport'),
                onPress: code.onContactSupport,
              }
            : undefined
        }
      />
    </Box>
  );
};

export const SocialProofCode = memo(SocialProofCodeComponent);
