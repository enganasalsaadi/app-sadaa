import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { moderateScale, motion, useTheme } from '@/core/theme';
import {
  Box,
  BrandLogo,
  CustomButton,
  CustomInput,
  HeroSheet,
  InlineError,
  Layout,
  PhoneInput,
  Pressable,
  Text,
  useHeroCompact,
} from '@/shared/ui';
import { AccountTypeSheet } from '../../components/AccountTypeSheet';
import { useLoginScreen } from './hooks/useLoginScreen';

const LOGO_HEIGHT = moderateScale(44);
const heroEntering = FadeIn.duration(motion.duration.base);
const heroExiting = FadeOut.duration(motion.duration.fast);

// Own component so keyboard show/hide re-renders only the hero, not the form.
// Compact (keyboard open / short screen): symbol only, tight padding.
const LoginHero: React.FC = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const compact = useHeroCompact();

  return (
    <Box px="xl" pt={compact ? 'xs' : 'xl'} pb={compact ? 'lg' : '3xl'} align="center" gap="md">
      <Animated.View key={compact ? 'symbol' : 'full'} entering={heroEntering}>
        {compact ? (
          <BrandLogo variant="symbol" height={sizes.icon.lg} surface="brand" />
        ) : (
          <BrandLogo variant="full" height={LOGO_HEIGHT} surface="brand" />
        )}
      </Animated.View>
      {compact ? null : (
        <Animated.View entering={heroEntering} exiting={heroExiting}>
          <Text variant="body" align="center" color={colors.text.onBrandMuted}>
            {t('common.tagline')}
          </Text>
        </Animated.View>
      )}
    </Box>
  );
});

const OrDivider: React.FC = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box row align="center" gap="md" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Box flex={1} borderTopWidth="thin" borderColor={colors.border.default} />
      <Text variant="caption" color={colors.text.tertiary}>
        {t('auth.login.or')}
      </Text>
      <Box flex={1} borderTopWidth="thin" borderColor={colors.border.default} />
    </Box>
  );
});

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    control,
    setFocus,
    onChangeCountry,
    onSubmit,
    isSubmitting,
    apiError,
    onForgotPassword,
    accountSheetVisible,
    openAccountSheet,
    closeAccountSheet,
    onSelectAccountType,
  } = useLoginScreen();
  const countryCode = useWatch({ control, name: 'countryCode' });

  return (
    <HeroSheet header={<LoginHero />}>
      <Layout
        padding={{ y: '2xl' }}
      >
        <Box gap="2xl">
          <Box gap="xs">
            <Text variant="h2" color={colors.text.primary} accessibilityRole="header">
              {t('auth.login.title')}
            </Text>
            <Text variant="body" color={colors.text.secondary}>
              {t('auth.login.subtitle')}
            </Text>
          </Box>

          <Box gap="lg">
            <Controller
              control={control}
              name="phone"
              render={({ field: { ref, value, onChange }, fieldState }) => (
                <PhoneInput
                  ref={ref}
                  label={t('auth.phone')}
                  placeholder={t('auth.phonePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  countryCode={countryCode}
                  onChangeCountry={onChangeCountry}
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus('password')}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Box gap="xs">
              <Controller
                control={control}
                name="password"
                render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
                  <CustomInput
                    ref={ref}
                    label={t('auth.password')}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    autoComplete="current-password"
                    returnKeyType="go"
                    onSubmitEditing={onSubmit}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Pressable
                onPress={onForgotPassword}
                alignSelf="flex-end"
                minHeight={sizes.button.md}
                justify="center"
                accessibilityRole="link"
                accessibilityLabel={t('auth.login.forgotPassword')}
              >
                <Text variant="bodyMedium" color={colors.interactive.text}>
                  {t('auth.login.forgotPassword')}
                </Text>
              </Pressable>
            </Box>
          </Box>

          <InlineError error={apiError} />

          <Box gap="lg">
            <CustomButton
              title={t('auth.login.submit')}
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            />
            <OrDivider />
            <Box gap="sm" align="center">
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('auth.login.noAccount')}
              </Text>
              <CustomButton
                title={t('auth.login.createAccount')}
                onPress={openAccountSheet}
                variant="secondary"
                disabled={isSubmitting}
                fullWidth
              />
            </Box>
          </Box>
        </Box>
      </Layout>

      <AccountTypeSheet
        visible={accountSheetVisible}
        onClose={closeAccountSheet}
        onSelect={onSelectAccountType}
      />
    </HeroSheet>
  );
};
