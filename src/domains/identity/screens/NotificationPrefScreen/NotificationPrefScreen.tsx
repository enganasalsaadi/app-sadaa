import React, { memo } from 'react';
import { Switch, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, useStyles } from '@/core/theme';
import { Layout } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { useNotificationPref } from './hooks/useNotificationPref';
import type { NotificationToggles } from './hooks/useNotificationPref';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';

const NOTIFICATION_KEYS: (keyof NotificationToggles)[] = [
  'booking_confirmations',
  'booking_reminders',
  'review_requests',
  'promotions',
];

const NotificationPrefScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(({ colors: c, borderWidths }) => ({
    divider: {
      borderBottomWidth: borderWidths.hairline,
      borderBottomColor: c.border.default,
    },
    switch: {
      transform: [
        { scaleX: Platform.OS === 'ios' ? 1 : 1.3 },
        { scaleY: Platform.OS === 'ios' ? 1 : 1.3 },
      ],
    },
  }));
  const { toggles, setToggle, handleSave, isFetching, isSaving } =
    useNotificationPref();

  useHideBottomBar();
  return (
    <Layout
      withGradient={false}
      withScroll
      contentPadding={false}
      screenHeader={{
        title: t('account.notificationPref.title'),
        fillStatusBar: true,
      }}
      ctaButton={{
        label: t('account.notificationPref.save'),
        onPress: handleSave,
        isLoading: isSaving,
        disabled: isFetching || isSaving,
        alwaysSolid: true,
      }}
    >
      <Box px="2xl" pt="lg" pb="6xl">
        <Box
          borderRadius="lg"
          bg={colors.surface.main}
          borderWidth="hairline"
          borderColor={colors.border.default}
          overflow="hidden"
        >
          {NOTIFICATION_KEYS.map((key, index) => {
            const isLast = index === NOTIFICATION_KEYS.length - 1;
            return (
              <Box
                key={key}
                row
                align="center"
                px="lg"
                py="md"
                style={isLast ? undefined : styles.divider}
              >
                <Box flex={1} me="md">
                  <Text variant="body" color={colors.text.primary}>
                    {t(`account.notificationPref.${key}`)}
                  </Text>
                </Box>
                <Switch
                  style={styles.switch}
                  value={toggles[key]}
                  onValueChange={val => setToggle(key, val)}
                  trackColor={{
                    false: colors.form.switch.trackOff,
                    true: colors.form.switch.trackOn,
                  }}
                  thumbColor={colors.form.switch.thumb}
                  ios_backgroundColor={colors.form.switch.trackOff}
                  accessibilityLabel={t(`account.notificationPref.${key}`)}
                  disabled={isFetching}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Layout>
  );
};

export const NotificationPrefScreen = memo(NotificationPrefScreenComponent);
