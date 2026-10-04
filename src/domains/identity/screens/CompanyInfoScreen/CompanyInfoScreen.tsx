import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import {
  Box,
  ChipGroup,
  CustomInput,
  ErrorState,
  FormSection,
  Layout,
  LayoutFooter,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { LockedPhoneField } from '../../components/LockedPhoneField';
import { ProfileFormSkeleton } from '../../components/ProfileFormSkeleton';
import { COMPANY_NAME_MAX_LENGTH } from '../../schemas/companyInfoSchema';
import { CompanySocialLinks } from './components/CompanySocialLinks';
import { useCompanyInfoScreen, type CompanyInfoScreenModel } from './hooks/useCompanyInfoScreen';

const CompanyInfoForm: React.FC<{ vm: CompanyInfoScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { control } = vm;

  return (
    <Box gap="3xl">
      <FormSection title={t('account.companyInfo.basicSection')}>
        <Box gap="lg">
          <Controller
            control={control}
            name="companyName"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('account.companyInfo.companyName')}
                placeholder={t('account.companyInfo.companyNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={COMPANY_NAME_MAX_LENGTH}
                autoComplete="organization"
                textContentType="organizationName"
                returnKeyType="next"
                onSubmitEditing={vm.focusEmail}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('account.companyInfo.email')}
                placeholder={t('account.companyInfo.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                error={fieldState.error?.message}
              />
            )}
          />
          <LockedPhoneField phone={vm.phone} onContactSupport={vm.onContactSupport} />
        </Box>
      </FormSection>

      <Controller
        control={control}
        name="businessType"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection title={t('account.companyInfo.businessType')} error={fieldState.error?.message}>
            <ChipGroup
              items={vm.businessTypes.items}
              value={value}
              onChange={onChange}
              loading={vm.businessTypes.isLoading}
              disabled={vm.isSaving}
              accessibilityLabel={t('account.companyInfo.businessType')}
            />
          </FormSection>
        )}
      />

      <Controller
        control={control}
        name="governorate"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection title={t('account.companyInfo.governorate')} error={fieldState.error?.message}>
            <ChipGroup
              items={vm.governorates.items}
              value={value}
              onChange={onChange}
              loading={vm.governorates.isLoading}
              skeletonCount={8}
              disabled={vm.isSaving}
              accessibilityLabel={t('account.companyInfo.governorate')}
            />
          </FormSection>
        )}
      />

      <CompanySocialLinks vm={vm} />
    </Box>
  );
});

/** Detail archetype, brands only: company name, email, activity, city and links; phone stays locked. */
const CompanyInfoScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useCompanyInfoScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <ProfileFormSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.loadError} onRetry={vm.retry} />
  ) : (
    <CompanyInfoForm vm={vm} />
  );

  return (
    <>
      <Layout
        header={{ title: t('account.companyInfo.title') }}
        footer={
          vm.isLoading || vm.isError ? undefined : (
            <LayoutFooter
              primary={{ label: t('common.save'), onPress: vm.onSave, loading: vm.isSaving }}
            />
          )
        }
      >
        {body}
      </Layout>
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const CompanyInfoScreen = memo(CompanyInfoScreenComponent);
