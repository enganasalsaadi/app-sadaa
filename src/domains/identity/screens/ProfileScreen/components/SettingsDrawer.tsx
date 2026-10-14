import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  KeyRound,
  Palette,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { moderateScale, useTheme, type ThemeMode } from '@/core/theme';
import { Box, Pressable, SectionHeader, SegmentedControl, Text } from '@/shared/ui';

const ROW_MIN = moderateScale(56);
const DOT = moderateScale(8);

interface DrawerRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  /** A green dot before the value: the setting is on. */
  on?: boolean;
  onPress?: () => void;
}

const DrawerRow = memo<DrawerRowProps>(({ icon: Icon, label, value, on = false, onPress }) => {
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      row
      align="center"
      gap="md"
      px="lg"
      minHeight={ROW_MIN}
      borderTopWidth="thin"
      borderColor={colors.border.default}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={value ? `${label}, ${value}` : label}
    >
      <Icon size={sizes.icon.md} color={colors.icon.secondary} />
      <Box flex={1}>
        <Text variant="body" numberOfLines={1}>
          {label}
        </Text>
      </Box>
      {on ? <Box width={DOT} height={DOT} borderRadius="full" bg={colors.status.success.main} /> : null}
      {value ? (
        <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? <Chevron size={sizes.icon.sm} color={colors.icon.secondary} /> : null}
    </Pressable>
  );
});

interface SettingsDrawerProps {
  themeMode: ThemeMode;
  pushEnabled: boolean;
  languageLabel: string;
  onThemeModeChange: (mode: ThemeMode) => void;
  onLanguage: () => void;
  onPassword: () => void;
  onDealGuide: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  onDevShowcase: () => void;
}

/** Settings in one drawer: appearance on top, then calm rows; push shows here once it is on. */
const SettingsDrawerComponent: React.FC<SettingsDrawerProps> = ({
  themeMode,
  pushEnabled,
  languageLabel,
  onThemeModeChange,
  onLanguage,
  onPassword,
  onDealGuide,
  onTerms,
  onPrivacy,
  onDevShowcase,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
      <Box borderRadius="xl" bg={colors.surface.main} borderWidth="thin" borderColor={colors.border.card} shadow="card" overflow="hidden">
        <Box p="md">
          <SegmentedControl<ThemeMode>
            options={themeOptions}
            value={themeMode}
            onChange={onThemeModeChange}
            accessibilityLabel={t('account.profile.appearance.title')}
          />
        </Box>
        {pushEnabled ? (
          <DrawerRow icon={Bell} label={t('account.profile.push.title')} value={t('account.profile.push.on')} on />
        ) : null}
        <DrawerRow icon={Globe} label={t('account.profile.language')} value={languageLabel} onPress={onLanguage} />
        <DrawerRow icon={KeyRound} label={t('account.profile.changePassword')} onPress={onPassword} />
        <DrawerRow icon={BookOpenText} label={t('marketplace.guide.title')} onPress={onDealGuide} />
        <DrawerRow icon={FileText} label={t('account.profile.terms')} onPress={onTerms} />
        <DrawerRow icon={ShieldCheck} label={t('account.profile.privacy')} onPress={onPrivacy} />
        {/* Dev-only showcase entry, dropped from release builds with `__DEV__`. */}
        {__DEV__ ? <DrawerRow icon={Palette} label={t('devShowcase.entryLabel')} onPress={onDevShowcase} /> : null}
      </Box>
    </Box>
  );
};

export const SettingsDrawer = memo(SettingsDrawerComponent);
