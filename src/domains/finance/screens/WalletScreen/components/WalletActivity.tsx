import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Notice, Pressable, SectionHeader, Skeleton, Text } from '@/shared/ui';
import { WalletDayGroup } from '../../../components';
import type { WalletActivityModel } from '../hooks/useWalletActivity';

const SKELETON_ROWS = [0, 1, 2] as const;
const ROW_SKELETON_HEIGHT = moderateScale(44);
const EMPTY_ICON = moderateScale(56);

interface WalletActivityProps {
  activity: WalletActivityModel;
  emptyMessage: string;
  hidden: boolean;
  onOpenStatement: () => void;
  onPressLine: (reference: string) => void;
}

/**
 * The latest lines grouped by day; empty, loading and error stay inside the section.
 * "All" and, when there are more lines, the link under the days open the statement.
 */
const WalletActivityComponent: React.FC<WalletActivityProps> = ({
  activity,
  emptyMessage,
  hidden,
  onOpenStatement,
  onPressLine,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const body = (() => {
    switch (activity.status) {
      case 'loading':
        return (
          <Card px="lg" py="md">
            <Box gap="lg">
              {SKELETON_ROWS.map(row => (
                <Skeleton key={row} width="100%" height={ROW_SKELETON_HEIGHT} borderRadius="md" />
              ))}
            </Box>
          </Card>
        );
      case 'error':
        return (
          <Notice
            tone="danger"
            message={t('finance.wallet.activity.loadFailed')}
            action={{ label: t('common.retry'), onPress: activity.retry }}
          />
        );
      case 'empty':
        return (
          <Card p="xl">
            <Box align="center" gap="sm">
              <Box
                width={EMPTY_ICON}
                height={EMPTY_ICON}
                borderRadius="full"
                bg={colors.money.soft}
                align="center"
                justify="center"
              >
                <Wallet size={sizes.icon.md} color={colors.money.main} />
              </Box>
              <Text variant="title" align="center">
                {t('finance.wallet.activity.emptyTitle')}
              </Text>
              <Text variant="bodySmall" color={colors.text.secondary} align="center">
                {emptyMessage}
              </Text>
            </Box>
          </Card>
        );
      case 'ready':
        return (
          <Box gap="lg">
            {activity.days.map(day => (
              <WalletDayGroup key={day.key} day={day} hidden={hidden} onPressLine={onPressLine} />
            ))}
            {activity.hasMore ? (
              <Pressable
                onPress={onOpenStatement}
                alignSelf="center"
                minHeight={sizes.button.md}
                justify="center"
                accessibilityRole="link"
                accessibilityLabel={t('finance.wallet.activity.viewStatement')}
              >
                <Text variant="bodyMedium" color={colors.interactive.text}>
                  {t('finance.wallet.activity.viewStatement')}
                </Text>
              </Pressable>
            ) : null}
          </Box>
        );
      default: {
        const _exhaustive: never = activity.status;
        return _exhaustive;
      }
    }
  })();

  return (
    <Box gap="md">
      <SectionHeader
        title={t('finance.wallet.activity.title')}
        action={
          activity.status === 'ready'
            ? { label: t('common.seeAll'), onPress: onOpenStatement }
            : undefined
        }
      />
      {body}
    </Box>
  );
};

export const WalletActivity = memo(WalletActivityComponent);
