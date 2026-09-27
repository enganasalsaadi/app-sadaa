import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, CustomButton } from '@/shared/ui';
import type { ButtonSize } from '@/shared/ui';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react-native';
import { useTheme, BUTTON_COLOR_VARIANTS } from '@/core/theme';

const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const noop = () => {};

const ButtonsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const ForwardIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Box gap="lg">
      {BUTTON_COLOR_VARIANTS.map(variant => (
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
