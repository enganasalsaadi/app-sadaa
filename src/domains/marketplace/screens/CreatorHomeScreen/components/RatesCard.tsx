import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, MapPin, Plus } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  CustomButton,
  Divider,
  MoneyText,
  Notice,
  SectionHeader,
  Skeleton,
  SocialPlatformIcon,
  Text,
} from '@/shared/ui';
import type { RateRow } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const SKELETON_ROWS = ['a', 'b', 'c'] as const;

const RateLine = memo<{ row: RateRow }>(({ row }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const where = row.platformLabel ?? t('account.rates.inPerson');
  const caption = row.packageLabel ? `${where} · ${row.packageLabel}` : where;
  const Fallback = row.platform === null ? MapPin : Link2;
  return (
    <Box row align="center" gap="md" py="md">
      <Box
        width={sizes.avatar.sm}
        height={sizes.avatar.sm}
        borderRadius="full"
        bg={colors.surface.elevated}
        align="center"
        justify="center"
      >
        {row.platform && isSocialPlatform(row.platform) ? (
          <SocialPlatformIcon platform={row.platform} size={sizes.icon.sm} color={colors.icon.secondary} />
        ) : (
          <Fallback size={sizes.icon.sm} color={colors.icon.secondary} />
        )}
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" numberOfLines={1}>
          {row.serviceLabel}
        </Text>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {caption}
        </Text>
      </Box>
      <MoneyText value={row.price} />
    </Box>
  );
});

interface RatesCardProps {
  rates: CreatorHomeScreenModel['rates'];
  onEdit: () => void;
}

/** "My rates": one line per saved price; editing opens the rates screen. */
const RatesCardComponent: React.FC<RatesCardProps> = ({ rates, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hasRows = rates.rows.length > 0;

  const renderBody = () => {
    if (rates.isLoading) {
      return (
        <Card shadow="none" px="lg" py="sm">
          {SKELETON_ROWS.map(key => (
            <Box key={key} row align="center" gap="md" py="md">
              <Skeleton width={sizes.avatar.sm} height={sizes.avatar.sm} borderRadius="full" />
              <Box flex={1}>
                <Skeleton width="50%" height={sizes.icon.sm} borderRadius="sm" />
              </Box>
              <Skeleton width={sizes.avatar.lg} height={sizes.icon.sm} borderRadius="sm" />
            </Box>
          ))}
        </Card>
      );
    }
    if (rates.isError) {
      return (
        <Notice
          tone="danger"
          message={t('marketplace.creatorHome.rates.loadFailed')}
          action={{ label: t('common.retry'), onPress: rates.retry }}
        />
      );
    }
    if (!hasRows) {
      return (
        <Card shadow="none" p="lg">
          <Box gap="md">
            <Text variant="body" color={colors.text.secondary}>
              {t('marketplace.creatorHome.rates.empty')}
            </Text>
            <CustomButton
              title={t('marketplace.creatorHome.rates.add')}
              variant="secondary"
              size="md"
              leftIcon={<Plus />}
              onPress={onEdit}
              fullWidth
            />
          </Box>
        </Card>
      );
    }
    return (
      <Card shadow="none" px="lg" py="xs">
        {rates.rows.map((row, index) => (
          <React.Fragment key={row.key}>
            {index > 0 ? <Divider /> : null}
            <RateLine row={row} />
          </React.Fragment>
        ))}
      </Card>
    );
  };

  return (
    <Box gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.rates.title')}
        emphasis="strong"
        action={
          hasRows ? { label: t('marketplace.creatorHome.rates.edit'), onPress: onEdit } : undefined
        }
      />
      {renderBody()}
    </Box>
  );
};

export const RatesCard = memo(RatesCardComponent);
