import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BrandLogo,
  Box,
  CustomInput,
  HeroSheet,
  Layout,
  LayoutFooter,
  PhoneInput,
  Text,
  useHeroCompact,
} from '@/shared/ui';
import { moderateScale, useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { useLayoutHeroSheetScreen } from './hooks/useLayoutHeroSheetScreen';

const LOGO_HEIGHT = moderateScale(48);

const DemoHero: React.FC = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const compact = useHeroCompact();

  return (
    <Box
      px="xl"
      pt={compact ? 'xs' : 'xl'}
      pb={compact ? 'lg' : '3xl'}
      align="center"
      gap="md"
    >
      {compact ? (
        <BrandLogo variant="symbol" height={sizes.icon.lg} surface="brand" />
      ) : (
        <BrandLogo variant="full" height={LOGO_HEIGHT} surface="brand" />
      )}
      {compact ? null : (
        <Text variant="body" align="center" color={colors.text.onBrandMuted}>
          {t('devShowcase.layoutGallery.heroSheetDescription')}
        </Text>
      )}
    </Box>
  );
});

/** Auth/entry archetype (rule 09): navy hero + surface sheet; the hero trims when the keyboard opens. */
const LayoutHeroSheetScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { phone, setPhone, country, setCountry, password, setPassword } =
    useLayoutHeroSheetScreen();

  return (
    <HeroSheet header={<DemoHero />}>
      <Layout
        padding={{ y: '2xl' }}
        footer={
          <LayoutFooter
            primary={{ label: t('common.back'), onPress: goBack }}
          />
        }
      >
        <Box gap="lg">
          <Text variant="h2">
            {t('devShowcase.layoutGallery.heroSheetTitle')}
          </Text>
          <PhoneInput
            label={t('devShowcase.inputs.phoneLabel')}
            placeholder={t('devShowcase.inputs.phonePlaceholder')}
            value={phone}
            onChangeText={setPhone}
            countryCode={country}
            onChangeCountry={setCountry}
          />
          <CustomInput
            label={t('devShowcase.inputs.passwordLabel')}
            placeholder={t('devShowcase.inputs.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            isPassword
          />
        </Box>
      </Layout>
    </HeroSheet>
  );
};

export const LayoutHeroSheetScreen = memo(LayoutHeroSheetScreenComponent);
