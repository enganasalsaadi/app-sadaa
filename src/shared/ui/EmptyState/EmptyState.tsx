import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { CustomButton } from '../CustomButton';
import type { ButtonVariant } from '../CustomButton';

export type EmptyStateTone = 'neutral' | 'danger';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
  /** Default `primary`: an empty screen's action is its main one. */
  variant?: ButtonVariant;
  loading?: boolean;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: EmptyStateAction;
  tone?: EmptyStateTone;
}

/** Centered placeholder for a screen or list with nothing to show. Errors → `ErrorState`. */
const EmptyStateComponent: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  action,
  tone = 'neutral',
}) => {
  const { colors, sizes } = useTheme();
  const isDanger = tone === 'danger';

  return (
    <Box align="center" justify="center" gap="lg" py="4xl" px="2xl">
      <Box
        width={sizes.illustration.sm}
        height={sizes.illustration.sm}
        borderRadius="full"
        bg={isDanger ? colors.status.danger.soft : colors.surface.elevated}
        align="center"
        justify="center"
      >
        <Icon
          size={sizes.icon.lg}
          color={isDanger ? colors.status.danger.main : colors.icon.secondary}
          strokeWidth={iconStroke.thin}
        />
      </Box>
      <Box gap="sm" align="center">
        <Text variant="h4" align="center" accessibilityRole="header">
          {title}
        </Text>
        {message ? (
          <Text variant="body" color={colors.text.secondary} align="center">
            {message}
          </Text>
        ) : null}
      </Box>
      {action ? (
        <CustomButton
          title={action.label}
          onPress={action.onPress}
          variant={action.variant ?? 'primary'}
          loading={action.loading}
          size="md"
        />
      ) : null}
    </Box>
  );
};

export const EmptyState = memo(EmptyStateComponent);
