import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Text } from '@/shared/ui';

export interface VerificationCodeCardProps {
  /** e.g. `SADA-4821`. */
  code: string;
  /** The brand page the code must be sent from; shown without the scheme. */
  pageUrl?: string;
  /** Clipboard + toast stay in the screen hook. */
  onCopy: () => void;
}

const displayUrl = (url: string) => url.replace(/^https?:\/\//, '');

/** Social page proof: the code to DM from the store's page, with a copy action. */
const VerificationCodeCardComponent: React.FC<VerificationCodeCardProps> = ({ code, pageUrl, onCopy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const label = t('account.verification.social.code.label');

  return (
    <Card px="lg" py="xl">
      <Box gap="md" align="center">
        <Text variant="caption" color={colors.text.tertiary}>
          {label}
        </Text>
        <Text
          variant="h1"
          color={colors.brand.text}
          align="center"
          writingDirection="ltr"
          selectable
          accessibilityLabel={`${label}: ${code}`}
        >
          {code}
        </Text>
        <CustomButton
          title={t('account.verification.social.code.copy')}
          variant="secondary"
          size="sm"
          leftIcon={<Copy size={sizes.icon.sm} />}
          onPress={onCopy}
          accessibilityLabel={t('account.verification.social.code.copy')}
        />
        {pageUrl ? (
          <Text variant="caption" color={colors.text.tertiary} align="center" writingDirection="ltr" numberOfLines={1}>
            {displayUrl(pageUrl)}
          </Text>
        ) : null}
      </Box>
    </Card>
  );
};

export const VerificationCodeCard = memo(VerificationCodeCardComponent);
