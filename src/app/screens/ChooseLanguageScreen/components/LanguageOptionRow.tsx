import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme, useStyles, moderateScale } from '@/core/theme';
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
    const { colors } = useTheme();
    const styles = useStyles(() => ({
      title: { width: '100%' as const, lineHeight: moderateScale(40) },
      line: { width: '100%' as const, lineHeight: moderateScale(30) },
    }));
    const base = `chooseLanguage.options.${id}` as const;

    const handlePress = useCallback(() => {
      onSelect(id);
    }, [id, onSelect]);

    return (
      <Card
        onPress={handlePress}
        selected={isSelected}
        p="xl"
        accessibilityLabel={t(`${base}.a11yLabel`)}
        accessibilityHint={t(`${base}.a11yHint`)}
        shadow="sm"
      >
        <Box align={align}>
          <Text
            variant="h2"
            style={styles.title}
            align={align === 'flex-start' ? 'left' : 'right'}
          >
            {t(`${base}.title`)}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            mt="xs"
            align={align === 'flex-start' ? 'left' : 'right'}
            style={styles.line}
          >
            {t(`${base}.subtitle`)}
          </Text>
        </Box>
        <Text
          variant="button"
          mt="lg"
          align={align === 'flex-start' ? 'left' : 'right'}
          style={styles.line}
        >
          {t(`${base}.label`)}
        </Text>
      </Card>
    );
  },
);

LanguageOptionRow.displayName = 'LanguageOptionRow';
