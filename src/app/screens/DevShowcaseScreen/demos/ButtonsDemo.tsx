import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card, CustomButton } from '@/shared/ui';
import type { ButtonSize } from '@/shared/ui';
import { useTheme, BUTTON_COLOR_VARIANTS } from '@/core/theme';

const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

const ButtonsSectionComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Card>
      <Box gap="lg">
        <Text variant="title">{t('devShowcase.sections.buttons')}</Text>

        {BUTTON_COLOR_VARIANTS.map(variant => (
          <Box key={variant} row wrap gap="sm" align="center">
            {BUTTON_SIZES.map(size => (
              <CustomButton
                key={`${variant}-${size}`}
                title={t('devShowcase.buttons.sampleLabel', { variant, size })}
                variant={variant}
                size={size}
                onPress={() => {}}
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
              onPress={() => {}}
            />
            <CustomButton
              title={t('devShowcase.buttons.stateDisabled')}
              onPress={() => {}}
              disabled
            />
            <CustomButton
              title={t('devShowcase.buttons.stateLoading')}
              onPress={() => {}}
              loading
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export const ButtonsSection = memo(ButtonsSectionComponent);
