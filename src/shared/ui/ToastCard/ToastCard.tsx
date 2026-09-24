import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import type { StatusTone } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastCardProps {
  type: ToastType;
  message: string;
  onHide?: () => void;
}

const TOAST_TONE: Record<ToastType, StatusTone> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const ToastCard: React.FC<ToastCardProps> = ({
  type,
  message,
  onHide,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const tone = colors.status[TOAST_TONE[type]];
  const Icon = ICONS[type];

  return (
    <Box
      row
      align="center"
      gap="xl"
      px="md"
      py="xl"
      borderRadius="lg"
      mx="md"
      overflow="hidden"
      mt="xl"
      bg={tone.soft}
      borderColor={tone.main}
      borderWidth="hairline"
    >
      <Icon size={sizes.icon.md} color={tone.main} strokeWidth={2} />

      <Text variant="bodySmall" color={tone.text} style={styles.message}>
        {message}
      </Text>

      {onHide ? (
        <Pressable
          onPress={onHide}
          hitSlop={16}
          align="center"
          justify="center"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <X size={sizes.icon.xs} color={tone.text} strokeWidth={2} />
        </Pressable>
      ) : null}
    </Box>
  );
};

const styles = StyleSheet.create({
  message: { flex: 1 },
});
