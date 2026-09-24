import React, { memo } from 'react';
import { BackHandler, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, moderateScale } from '@/core/theme';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { Pressable } from '@/shared/ui/primitives/Pressable';

interface Props {
  message?: string | null;
}

const MaintenanceScreenComponent: React.FC<Props> = ({ message }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <Box
      flex={1}
      bg={colors.layout.base}
      align="center"
      justify="center"
      px="3xl"
      style={{ paddingTop: top, paddingBottom: bottom + moderateScale(24) }}
    >
      <StatusBar barStyle="dark-content" />
      <Box
        width={moderateScale(80)}
        height={moderateScale(80)}
        borderRadius="lg"
        bg={colors.surface.elevated}
        align="center"
        justify="center"
        mb="2xl"
      >
        <Wrench size={moderateScale(36)} color={colors.interactive.main} />
      </Box>

      <Text variant="h2" color={colors.text.primary} align="center" mb="md">
        {t('account.maintenance.title')}
      </Text>

      <Text
        variant="body"
        color={colors.text.secondary}
        align="center"
        mb="3xl"
      >
        {message || t('account.maintenance.defaultSubtitle')}
      </Text>

      <Pressable
        onPress={() => BackHandler.exitApp()}
        bg={colors.surface.elevated}
        px="3xl"
        py="md"
        borderRadius="lg"
      >
        <Text variant="button" color={colors.text.primary}>
          {t('account.maintenance.closeApp')}
        </Text>
      </Pressable>
    </Box>
  );
};

export const MaintenanceScreen = memo(MaintenanceScreenComponent);
