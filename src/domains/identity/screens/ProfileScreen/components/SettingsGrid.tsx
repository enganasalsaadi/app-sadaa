import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Globe,
  KeyRound,
  Lock,
  Palette,
  SunMoon,
  type LucideIcon,
} from 'lucide-react-native';
import { moderateScale, useTheme, type ThemeMode } from '@/core/theme';
import { Box, Card, SectionHeader, SegmentedControl, Text } from '@/shared/ui';

const ICON_BOX = moderateScale(36);

interface SettingsTile {
  key: string;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

const Tile = memo<{ tile: SettingsTile }>(({ tile }) => {
  const { colors, sizes } = useTheme();
  const Icon = tile.icon;
  return (
    <Card flex={1} p="md" onPress={tile.onPress} accessibilityLabel={tile.label}>
      <Box gap="sm">
        <Box
          width={ICON_BOX}
          height={ICON_BOX}
          borderRadius="md"
          bg={colors.surface.elevated}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.icon.primary} />
        </Box>
        <Text variant="bodyMedium" numberOfLines={1}>
          {tile.label}
        </Text>
      </Box>
    </Card>
  );
});

interface SettingsGridProps {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onPassword: () => void;
  onLanguage: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  onDevShowcase: () => void;
}

/** Settings as a two-column tile grid + one wide appearance tile (no arrow rows). */
const SettingsGridComponent: React.FC<SettingsGridProps> = ({
  themeMode,
  onThemeModeChange,
  onPassword,
  onLanguage,
  onTerms,
  onPrivacy,
  onDevShowcase,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const rows = useMemo(() => {
    const tiles: SettingsTile[] = [
      { key: 'password', icon: KeyRound, label: t('account.profile.changePassword'), onPress: onPassword },
      { key: 'language', icon: Globe, label: t('account.profile.language'), onPress: onLanguage },
      { key: 'terms', icon: FileText, label: t('account.profile.terms'), onPress: onTerms },
      { key: 'privacy', icon: Lock, label: t('account.profile.privacy'), onPress: onPrivacy },
    ];
    // Dev-only showcase entry, dropped from release builds with `__DEV__`.
    if (__DEV__) {
      tiles.push({ key: 'dev', icon: Palette, label: t('devShowcase.entryLabel'), onPress: onDevShowcase });
    }
    const pairs: [SettingsTile, SettingsTile | undefined][] = [];
    for (let i = 0; i < tiles.length; i += 2) {
      const first = tiles[i];
      if (first) pairs.push([first, tiles[i + 1]]);
    }
    return pairs;
  }, [t, onPassword, onLanguage, onTerms, onPrivacy, onDevShowcase]);

  const themeOptions = useMemo(
    () =>
      [
        { value: 'light', label: t('account.profile.appearance.light') },
        { value: 'dark', label: t('account.profile.appearance.dark') },
        { value: 'system', label: t('account.profile.appearance.system') },
      ] as const,
    [t],
  );

  return (
    <Box gap="md">
      <SectionHeader title={t('account.profile.settings')} />
      <Card p="md">
        <Box gap="md">
          <Box row align="center" gap="sm">
            <SunMoon size={sizes.icon.sm} color={colors.icon.primary} />
            <Text variant="bodyMedium">{t('account.profile.appearance.title')}</Text>
          </Box>
          <SegmentedControl<ThemeMode>
            options={themeOptions}
            value={themeMode}
            onChange={onThemeModeChange}
            accessibilityLabel={t('account.profile.appearance.title')}
          />
        </Box>
      </Card>
      {rows.map(([first, second]) => (
        <Box key={first.key} row gap="md">
          <Tile tile={first} />
          {second ? <Tile tile={second} /> : <Box flex={1} />}
        </Box>
      ))}
    </Box>
  );
};

export const SettingsGrid = memo(SettingsGridComponent);
