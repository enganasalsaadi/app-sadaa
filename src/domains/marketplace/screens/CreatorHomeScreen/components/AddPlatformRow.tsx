import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface AddPlatformRowProps {
  onPress: () => void;
}

/** Dashed row closing the platform list: reads as an empty slot, not another account. */
const AddPlatformRowComponent: React.FC<AddPlatformRowProps> = ({
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'row', ViewStyle> => ({
      row: { borderStyle: 'dashed', borderWidth: borderWidths.md },
    }),
  );

  return (
    <Pressable
      onPress={onPress}
      row
      p="md"
      gap="md"
      align="center"
      borderRadius="lg"
      borderColor={colors.border.strong}
      style={styles.row}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.creatorHome.platforms.add')}
    >
      <Box
        width={sizes.iconButton.sm}
        height={sizes.iconButton.sm}
        borderRadius="full"
        bg={colors.interactive.soft}
        align="center"
        justify="center"
      >
        <Plus size={sizes.icon.sm} color={colors.interactive.main} />
      </Box>
      <Text variant="bodyMedium" color={colors.interactive.text}>
        {t('marketplace.creatorHome.platforms.add')}
      </Text>
    </Pressable>
  );
};

export const AddPlatformRow = memo(AddPlatformRowComponent);
