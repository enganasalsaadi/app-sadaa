import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Pressable, Card, CustomButton } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { ThemeMode } from '@/core/theme';

interface TopControlBarProps {
  themeMode: ThemeMode;
  isRTL: boolean;
  language: string;
  onToggleTheme: () => void;
  onSetThemeMode: (mode: ThemeMode) => void;
}

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

const MODE_LABEL_KEY = {
  light: 'devShowcase.topBar.modeLight',
  dark: 'devShowcase.topBar.modeDark',
  system: 'devShowcase.topBar.modeSystem',
} as const;

const TopControlBarComponent: React.FC<TopControlBarProps> = ({
  themeMode,
  isRTL,
  language,
  onToggleTheme,
  onSetThemeMode,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const renderModeOption = useCallback(
    (candidateMode: ThemeMode) => {
      const isSelected = candidateMode === themeMode;
      return (
        <Pressable
          key={candidateMode}
          onPress={() => onSetThemeMode(candidateMode)}
          px="lg"
          py="sm"
          borderRadius="md"
          bg={isSelected ? colors.interactive.soft : undefined}
          accessibilityRole="button"
          accessibilityLabel={t(MODE_LABEL_KEY[candidateMode])}
        >
          <Text
            variant="bodySmall"
            color={isSelected ? colors.interactive.text : colors.text.secondary}
          >
            {t(MODE_LABEL_KEY[candidateMode])}
          </Text>
        </Pressable>
      );
    },
    [themeMode, colors, onSetThemeMode, t],
  );

  return (
    <Card mb="lg">
      <Box gap="md">
        <Box row align="center" justify="space-between">
          <Text variant="label" color={colors.text.secondary}>
            {t('devShowcase.topBar.themeLabel', {
              mode: t(MODE_LABEL_KEY[themeMode]),
            })}
          </Text>
          <CustomButton
            title={t('devShowcase.topBar.toggleTheme')}
            onPress={onToggleTheme}
            variant="outline"
            size="sm"
          />
        </Box>

        <Box row align="center" gap="sm">
          {MODES.map(renderModeOption)}
        </Box>

        <Box row align="center" justify="space-between">
          <Text variant="caption" color={colors.text.tertiary}>
            {t('devShowcase.topBar.languageLabel', { lang: language })}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('devShowcase.topBar.directionLabel', {
              dir: isRTL
                ? t('devShowcase.topBar.directionRtl')
                : t('devShowcase.topBar.directionLtr'),
            })}
          </Text>
        </Box>
      </Box>
    </Card>
  );
};

export const TopControlBar = memo(TopControlBarComponent);
