import React, { memo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Info,
  OctagonAlert,
  X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger' | 'premium';

export interface NoticeAction {
  label: string;
  onPress: () => void;
}

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  message: string;
  /** Overrides the tone's default icon. */
  icon?: LucideIcon;
  action?: NoticeAction;
  onDismiss?: () => void;
}

const TONE_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
  premium: Crown,
} as const satisfies Record<NoticeTone, LucideIcon>;

/** In-flow message block (KYC pending, payout on hold, upgrade offer). Transient → toast. */
const NoticeComponent: React.FC<NoticeProps> = ({
  tone = 'info',
  title,
  message,
  icon,
  action,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, tone);
  const Icon = icon ?? TONE_ICON[tone];
  const urgent = tone === 'warning' || tone === 'danger';

  return (
    <Box
      row
      align="flex-start"
      gap="md"
      p="md"
      borderRadius="lg"
      bg={hue.soft}
      accessibilityRole={urgent ? 'alert' : undefined}
    >
      <Icon size={sizes.icon.sm} color={hue.main} strokeWidth={iconStroke.regular} />
      <Box flex={1} gap="xs">
        {title ? (
          <Text variant="bodyMedium" color={hue.text}>
            {title}
          </Text>
        ) : null}
        <Text variant="bodySmall" color={colors.text.primary}>
          {message}
        </Text>
        {action ? (
          <Pressable
            onPress={action.onPress}
            alignSelf="flex-start"
            minHeight={sizes.button.sm}
            justify="center"
            hitSlop={sizes.hitSlop.md}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Text variant="bodyMedium" color={colors.interactive.text}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </Box>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={sizes.hitSlop.lg}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <X size={sizes.icon.sm} color={colors.icon.secondary} />
        </Pressable>
      ) : null}
    </Box>
  );
};

export const Notice = memo(NoticeComponent);
