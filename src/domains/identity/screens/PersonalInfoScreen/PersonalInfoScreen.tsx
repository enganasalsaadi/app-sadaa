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
import { AREA_MAX_LENGTH, FULL_NAME_MAX_LENGTH } from '../../schemas/personalInfoSchema';
import {
  usePersonalInfoScreen,
  type PersonalInfoScreenModel,
} from './hooks/usePersonalInfoScreen';

const PersonalInfoForm: React.FC<{ vm: PersonalInfoScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { control } = vm;

  return (
    <Box gap="3xl">
      <FormSection title={t('account.personalInfo.basicSection')}>
        <Box gap="lg">
          <Controller
            control={control}
            name="fullName"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('account.personalInfo.fullName')}
                placeholder={t('account.personalInfo.fullNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={FULL_NAME_MAX_LENGTH}
                autoComplete="name"
                textContentType="name"
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
                label={t('account.personalInfo.email')}
                placeholder={t('account.personalInfo.emailPlaceholder')}
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
        name="governorate"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection
            title={t('account.personalInfo.locationSection')}
            error={fieldState.error?.message}
          >
            <ChipGroup
              items={vm.governorates.items}
              value={value}
              onChange={onChange}
              loading={vm.governorates.isLoading}
              skeletonCount={8}
              disabled={vm.isSaving}
              accessibilityLabel={t('account.personalInfo.governorate')}
            />
          </FormSection>
        )}
      />
      <Controller
        control={control}
        name="area"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('account.personalInfo.area')}
            placeholder={t('account.personalInfo.areaPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            maxLength={AREA_MAX_LENGTH}
            textContentType="sublocality"
            returnKeyType="done"
            onSubmitEditing={vm.onSave}
            error={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
});

/** Detail archetype, creators only: name, email and location; the phone stays locked. */
const PersonalInfoScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = usePersonalInfoScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <ProfileFormSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.loadError} onRetry={vm.retry} />
  ) : (
    <PersonalInfoForm vm={vm} />
  );

  return (
    <>
      <Layout
        header={{ title: t('account.personalInfo.title') }}
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

export const PersonalInfoScreen = memo(PersonalInfoScreenComponent);
