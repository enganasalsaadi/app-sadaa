import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Upload } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';

interface KycRejectedStripProps {
  reason: string | null;
  isBrand: boolean;
  onReupload: () => void;
}

/** Why verification was refused, right under the hero, with the one way out. */
const KycRejectedStripComponent: React.FC<KycRejectedStripProps> = ({ reason, isBrand, onReupload }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box row gap="md" p="lg" borderRadius="xl" bg={colors.status.danger.soft} accessibilityRole="alert">
      <ShieldAlert size={sizes.icon.md} color={colors.status.danger.main} />
      <Box flex={1} gap="xs" align="flex-start">
        <Text variant="title" color={colors.status.danger.text}>
          {t('account.profile.kyc.rejectedTitle')}
        </Text>
        <Text variant="bodySmall" color={colors.text.primary}>
          {reason ?? t(isBrand ? 'account.profile.kyc.brand.rejectedBody' : 'account.profile.kyc.rejectedBody')}
        </Text>
        <Box mt="sm">
          <CustomButton
            title={t('account.profile.kyc.reupload')}
            variant="danger"
            size="md"
            leftIcon={<Upload />}
            onPress={onReupload}
          />
        </Box>
      </Box>
    </Box>
  );
};

export const KycRejectedStrip = memo(KycRejectedStripComponent);
