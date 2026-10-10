import React, { memo, useMemo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, FormSection, RadioGroup, Text } from '@/shared/ui';
import {
  BRAND_KYC_DOCUMENT_LABEL,
  type BrandKycDocumentGroup,
  type BrandKycDocumentType,
} from '../../../constants/kyc';
import type { KycScreenModel } from '../hooks/useKycScreen';
import { KycSlotPicker } from './KycSlotPicker';

interface KycUploadFormProps {
  vm: KycScreenModel;
}

const BRAND_INTRO = {
  company: 'account.kyc.brandIntro',
  owner: 'account.kyc.ownerIntro',
} as const satisfies Record<BrandKycDocumentGroup, ParseKeys>;

/** Both faces of a national ID: a creator's, or a brand owner's. */
const IdSlots: React.FC<KycUploadFormProps> = memo(({ vm }) => {
  const { t } = useTranslation();
  return (
    <Box gap="lg">
      <KycSlotPicker vm={vm} slot="idFront" title={t('account.kyc.idFront')} hint={t('account.kyc.idHint')} />
      <KycSlotPicker vm={vm} slot="idBack" title={t('account.kyc.idBack')} hint={t('account.kyc.idHint')} />
    </Box>
  );
});

/** Creator: both ID faces. Brand: a document type from the picked group + its files. */
const KycUploadFormComponent: React.FC<KycUploadFormProps> = ({ vm }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const documentTypes = useMemo(
    () =>
      vm.documentTypes.map(value => ({
        value,
        label: t(BRAND_KYC_DOCUMENT_LABEL[value]),
      })),
    [vm.documentTypes, t],
  );
  // A passport is one file but not company paperwork: its slot is named after it.
  const documentTitle = t(
    vm.documentType === 'owner_passport'
      ? BRAND_KYC_DOCUMENT_LABEL.owner_passport
      : 'account.kyc.document',
  );

  return (
    <Box gap="2xl">
      <Text variant="body" color={colors.text.secondary}>
        {t(vm.isBrand ? BRAND_INTRO[vm.documentGroup] : 'account.kyc.influencerIntro')}
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
          {vm.slots.includes('document') ? (
            <KycSlotPicker
              vm={vm}
              slot="document"
              title={documentTitle}
              hint={t('account.kyc.documentHint')}
            />
          ) : (
            <IdSlots vm={vm} />
          )}
        </>
      ) : (
        <IdSlots vm={vm} />
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
