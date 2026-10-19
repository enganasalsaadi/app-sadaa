import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import type { ContractTerms } from '@/core/api';
import { Box, SheetFrame, Text } from '@/shared/ui';

interface MediaKitTermsSheetProps {
  visible: boolean;
  onClose: () => void;
  terms: ContractTerms['items'];
}

/** The creator's contract terms, opened from the escrow card: every deal with them runs under these. */
const MediaKitTermsSheetComponent: React.FC<MediaKitTermsSheetProps> = ({ visible, onClose, terms }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <SheetFrame
      visible={visible}
      onClose={onClose}
      title={t('account.mediaKit.previewScreen.terms')}
      body={t('account.mediaKit.showcase.termsHint')}
    >
      <Box gap="md" p="lg" borderRadius="lg" bg={colors.surface.main}>
        {terms.map(item => (
          <Box key={item.key} row gap="sm">
            <ShieldCheck size={sizes.icon.sm} color={colors.interactive.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {item.text}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </SheetFrame>
  );
};

export const MediaKitTermsSheet = memo(MediaKitTermsSheetComponent);
