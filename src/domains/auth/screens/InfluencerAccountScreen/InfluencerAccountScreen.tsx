import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Smartphone } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ChipGroup,
  ConfirmSheet,
  CustomInput,
  FormSection,
  InlineError,
  Layout, LayoutFooter,
  PhoneInput,
  Text,
} from '@/shared/ui';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';
import type { InfluencerAccountFormValues } from '../../schemas';
import { useInfluencerAccountScreen } from './hooks/useInfluencerAccountScreen';

// Subscribes to the password alone, so typing it doesn't re-render the form.
const WatchedPasswordStrength: React.FC<{ control: Control<InfluencerAccountFormValues> }> =
  memo(({ control }) => {
    const password = useWatch({ control, name: 'password' });
    return <PasswordStrengthMeter password={password} />;
  });

export const InfluencerAccountScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    control,
    setFocus,
    governorates,
    onChangeCountry,
    onContinue,
    confirmPhone,
    onConfirm,
    onEditPhone,
    onDismissConfirm,
    isSubmitting,
    apiError,
  } = useInfluencerAccountScreen();
  const countryCode = useWatch({ control, name: 'countryCode' });

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.influencerOnboarding.account.submit'),
            onPress: onContinue,
            loading: isSubmitting,
          }}
        />
      }
    >
      <Box gap="3xl">
        <FormSection title={t('auth.influencerOnboarding.account.sections.personal')}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('auth.influencerOnboarding.account.fullName')}
                placeholder={t('auth.influencerOnboarding.account.fullNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                textContentType="name"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('phone')}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormSection>

        <FormSection title={t('auth.brandOnboarding.account.sections.contact')}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { ref, value, onChange }, fieldState }) => (
              <Box gap="xs">
                <PhoneInput
                  ref={ref}
                  label={t('auth.phone')}
                  placeholder={t('auth.phonePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  countryCode={countryCode}
                  onChangeCountry={onChangeCountry}
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus('email')}
                  error={fieldState.error?.message}
                />
                <Text variant="caption" color={colors.text.secondary}>
                  {t('auth.brandOnboarding.account.phoneHint')}
                </Text>
              </Box>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('auth.influencerOnboarding.account.email')}
                placeholder={t('auth.influencerOnboarding.account.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('password')}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormSection>

        <Controller
          control={control}
          name="governorate"
          render={({ field: { value, onChange }, fieldState }) => (
            <FormSection
              title={t('auth.influencerOnboarding.account.governorate')}
              description={t('auth.influencerOnboarding.account.governorateHint')}
              error={fieldState.error?.message}
            >
              <ChipGroup
                items={governorates.items}
                value={value || null}
                onChange={onChange}
                loading={governorates.isLoading}
                skeletonCount={8}
                accessibilityLabel={t('auth.influencerOnboarding.account.governorate')}
              />
            </FormSection>
          )}
        />

        <FormSection title={t('auth.brandOnboarding.account.sections.security')}>
          <Controller
            control={control}
            name="password"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <Box gap="sm">
                <CustomInput
                  ref={ref}
                  label={t('auth.password')}
                  placeholder={t('auth.brandOnboarding.account.passwordPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  isPassword
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus('passwordConfirmation')}
                  error={fieldState.error?.message}
                />
                <WatchedPasswordStrength control={control} />
              </Box>
            )}
          />
          <Controller
            control={control}
            name="passwordConfirmation"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('auth.brandOnboarding.account.passwordConfirmation')}
                placeholder={t('auth.brandOnboarding.account.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onContinue}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormSection>

        <InlineError error={apiError} />
      </Box>

      <ConfirmSheet
        visible={confirmPhone !== null}
        onClose={onDismissConfirm}
        icon={<Smartphone size={sizes.icon.lg} color={colors.interactive.main} />}
        title={t('auth.brandOnboarding.account.confirmPhone.title')}
        body={t('auth.brandOnboarding.account.confirmPhone.body')}
        confirmLabel={t('auth.brandOnboarding.account.confirmPhone.confirm')}
        onConfirm={onConfirm}
        confirmLoading={isSubmitting}
        cancelLabel={t('auth.brandOnboarding.account.confirmPhone.edit')}
        onCancel={onEditPhone}
      >
        <Box
          align="center"
          py="lg"
          borderRadius="lg"
          bg={colors.surface.elevated}
        >
          <Text variant="h3" color={colors.text.primary}>
            {confirmPhone}
          </Text>
        </Box>
      </ConfirmSheet>
    </Layout>
  );
};
