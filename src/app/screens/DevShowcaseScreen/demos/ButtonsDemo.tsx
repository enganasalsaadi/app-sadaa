import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, CustomButton, GradientSurface } from '@/shared/ui';
import type { ButtonSize } from '@/shared/ui';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react-native';
import { useTheme, BUTTON_COLOR_VARIANTS } from '@/core/theme';

const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
/** Only readable over the navy gradient (rule 08), so they're demoed on it. */
const NAVY_VARIANTS = new Set<string>(['onBrand', 'glass']);
const NEUTRAL_VARIANTS = BUTTON_COLOR_VARIANTS.filter(variant => !NAVY_VARIANTS.has(variant));
const ON_NAVY_VARIANTS = BUTTON_COLOR_VARIANTS.filter(variant => NAVY_VARIANTS.has(variant));
const noop = () => {};

const ButtonsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Box gap="lg">
      {NEUTRAL_VARIANTS.map(variant => (
        <Box key={variant} row wrap gap="sm" align="center">
          {BUTTON_SIZES.map(size => (
            <CustomButton
              key={`${variant}-${size}`}
              title={t('devShowcase.buttons.sampleLabel', { variant, size })}
              variant={variant}
              size={size}
              onPress={noop}
            />
          ))}
        </Box>
      ))}

      <GradientSurface variant="brand" borderRadius="lg" p="lg" gap="sm">
        <Text variant="label" color={colors.text.onBrand}>
          {t('devShowcase.buttons.onNavyTitle')}
        </Text>
        {ON_NAVY_VARIANTS.map(variant => (
          <Box key={variant} row wrap gap="sm" align="center">
            {BUTTON_SIZES.map(size => (
              <CustomButton
                key={`${variant}-${size}`}
                title={t('devShowcase.buttons.sampleLabel', { variant, size })}
                variant={variant}
                size={size}
                onPress={noop}
              />
            ))}
          </Box>
        ))}
      </GradientSurface>

      <Box
        borderTopWidth="hairline"
        borderColor={colors.border.default}
        gap="sm"
        pt="lg"
      >
        <Text variant="label">{t('devShowcase.buttons.statesTitle')}</Text>
        <Box row wrap gap="sm">
          <CustomButton
            title={t('devShowcase.buttons.stateDefault')}
            onPress={noop}
          />
          <CustomButton
            title={t('devShowcase.buttons.stateDisabled')}
            onPress={noop}
            disabled
          />
          <CustomButton
            title={t('devShowcase.buttons.stateLoading')}
            onPress={noop}
            loading
          />
        </Box>
        <Box row wrap gap="sm">
          <CustomButton
            title={t('devShowcase.buttons.withLeftIcon')}
            onPress={noop}
            variant="secondary"
            leftIcon={<Plus />}
          />
          <CustomButton
            title={t('devShowcase.buttons.withRightIcon')}
            onPress={noop}
            variant="outline"
            rightIcon={<ForwardIcon />}
          />
        </Box>
        <CustomButton
          title={t('devShowcase.buttons.fullWidth')}
          onPress={noop}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export const ButtonsDemo = memo(ButtonsDemoComponent);
