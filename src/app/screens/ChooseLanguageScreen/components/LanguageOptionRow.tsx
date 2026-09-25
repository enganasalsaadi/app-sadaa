import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { SupportedLanguage } from '@/core/config';
import type { LanguageCardAlign } from '../data';

export interface LanguageOptionRowProps {
  id: SupportedLanguage;
  align: LanguageCardAlign;
  isSelected: boolean;
  onSelect: (id: SupportedLanguage) => void;
}

export const LanguageOptionRow = React.memo<LanguageOptionRowProps>(
  ({ id, align, isSelected, onSelect }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const base = `chooseLanguage.options.${id}` as const;

    const handlePress = useCallback(() => {
      onSelect(id);
    }, [id, onSelect]);

    return (
      <Card
        onPress={handlePress}
        selected={isSelected}
        bg={colors.surface.main}
        borderColor={isSelected ? colors.interactive.main : colors.border.default}
        borderWidth={isSelected ? 'sm' : 'thin'}
        p="md"
        row
        align="center"
        justify="space-between"
        accessibilityLabel={t(`${base}.a11yLabel`)}
        accessibilityHint={t(`${base}.a11yHint`)}
        shadow="sm"
      >
        <Text
          variant="h4"
          align={align === 'flex-start' ? 'left' : 'right'}
          writingDirection={id === 'en' ? 'ltr' : undefined}
        >
          {t(`${base}.label`)}
        </Text>
        {isSelected && (
          <Box
            width={sizes.icon.md}
            height={sizes.icon.md}
            borderRadius="full"
            bg={colors.interactive.main}
            align="center"
            justify="center"
          >
            <Check
              size={sizes.icon.xs}
              color={colors.text.onAccent}
              strokeWidth={2.5}
            />
          </Box>
        )}
      </Card>
    );
  },
);

LanguageOptionRow.displayName = 'LanguageOptionRow';
