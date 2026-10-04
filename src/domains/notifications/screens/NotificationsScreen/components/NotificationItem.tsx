import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, resolveHue, useTheme } from '@/core/theme';
import { Box, Divider, Pressable, Text } from '@/shared/ui';
import type { NotificationRowModel } from '../hooks/useNotificationsScreen';

const ICON_BOX = moderateScale(40);
const UNREAD_DOT = moderateScale(8);

interface NotificationItemProps {
  row: NotificationRowModel;
  onPress: (id: string) => void;
}

/** Inbox row: unread = dot + bold title (+ a11y label), never color alone. */
const NotificationItemComponent: React.FC<NotificationItemProps> = ({ row, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, row.tone);
  const Icon = row.icon;
  const handlePress = useCallback(() => onPress(row.id), [onPress, row.id]);

  return (
    <Box>
      <Pressable
        row
        gap="md"
        py="lg"
        align="flex-start"
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={[
          row.isUnread ? t('notifications.inbox.unread') : '',
          row.title,
          row.body,
          row.time,
        ]
          .filter(Boolean)
          .join(t('notifications.inbox.labelSeparator'))}
      >
        <Box
          width={ICON_BOX}
          height={ICON_BOX}
          borderRadius="md"
          bg={hue.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={hue.main} />
        </Box>
        <Box flex={1} gap="xs">
          <Box row gap="sm" align="center">
            <Box flex={1}>
              <Text variant={row.isUnread ? 'title' : 'bodyMedium'} numberOfLines={2}>
                {row.title}
              </Text>
            </Box>
            <Text variant="caption" color={colors.text.tertiary}>
              {row.time}
            </Text>
          </Box>
          {row.body ? (
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={3}>
              {row.body}
            </Text>
          ) : null}
        </Box>
        <Box width={UNREAD_DOT} pt="sm">
          {row.isUnread ? (
            <Box
              width={UNREAD_DOT}
              height={UNREAD_DOT}
              borderRadius="full"
              bg={colors.interactive.main}
            />
          ) : null}
        </Box>
      </Pressable>
      <Divider />
    </Box>
  );
};

export const NotificationItem = memo(NotificationItemComponent);
