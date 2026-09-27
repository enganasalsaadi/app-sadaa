import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomInput, FormSection } from '@/shared/ui';
import { useFormSectionDemo } from './hooks/useFormSectionDemo';

const FormSectionDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { name, setName, website, setWebsite } = useFormSectionDemo();

  return (
    <Box gap="2xl">
      <FormSection
        title={t('devShowcase.formSection.title')}
        description={t('devShowcase.formSection.description')}
      >
        <CustomInput
          label={t('devShowcase.formSection.nameLabel')}
          placeholder={t('devShowcase.formSection.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />
      </FormSection>

      <FormSection
        title={t('devShowcase.formSection.optionalTitle')}
        tag={t('devShowcase.formSection.optionalTag')}
        error={t('devShowcase.formSection.groupError')}
      >
        <CustomInput
          label={t('devShowcase.formSection.websiteLabel')}
          placeholder={t('devShowcase.formSection.websitePlaceholder')}
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />
      </FormSection>
    </Box>
  );
};

export const FormSectionDemo = memo(FormSectionDemoComponent);
