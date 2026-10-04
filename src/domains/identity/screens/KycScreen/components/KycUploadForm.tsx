import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, FormSection, RadioGroup, Text } from '@/shared/ui';
import {
  BRAND_KYC_DOCUMENT_LABEL,
  BRAND_KYC_DOCUMENT_TYPES,
  type BrandKycDocumentType,
} from '../../../constants/kyc';
import type { KycScreenModel } from '../hooks/useKycScreen';
import { KycSlotPicker } from './KycSlotPicker';

interface KycUploadFormProps {
  vm: KycScreenModel;
}

/** Creator: both ID faces. Brand: a document type + one company document. */
const KycUploadFormComponent: React.FC<KycUploadFormProps> = ({ vm }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const documentTypes = useMemo(
    () =>
      BRAND_KYC_DOCUMENT_TYPES.map(value => ({
        value,
        label: t(BRAND_KYC_DOCUMENT_LABEL[value]),
      })),
    [t],
  );

  return (
    <Box gap="2xl">
      <Text variant="body" color={colors.text.secondary}>
        {t(vm.isBrand ? 'account.kyc.brandIntro' : 'account.kyc.influencerIntro')}
      </Text>

      {vm.isBrand ? (
        <>
          <FormSection
            title={t('account.kyc.documentType')}
            error={vm.documentTypeError ?? undefined}
          >
            <RadioGroup<BrandKycDocumentType>
              items={documentTypes}
              value={vm.documentType}
              onChange={vm.onDocumentTypeChange}
              disabled={vm.isSubmitting}
              accessibilityLabel={t('account.kyc.documentType')}
            />
          </FormSection>
          <KycSlotPicker
            vm={vm}
            slot="document"
            title={t('account.kyc.document')}
            hint={t('account.kyc.documentHint')}
          />
        </>
      ) : (
        <Box gap="lg">
          <KycSlotPicker
            vm={vm}
            slot="idFront"
            title={t('account.kyc.idFront')}
            hint={t('account.kyc.idHint')}
          />
          <KycSlotPicker
            vm={vm}
            slot="idBack"
            title={t('account.kyc.idBack')}
            hint={t('account.kyc.idHint')}
          />
        </Box>
      )}

      <Box row align="center" gap="sm">
        <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="caption" color={colors.text.secondary}>
            {t('account.kyc.privacy')}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export const KycUploadForm = memo(KycUploadFormComponent);
