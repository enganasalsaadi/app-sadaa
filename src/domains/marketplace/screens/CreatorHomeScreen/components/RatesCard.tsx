import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomButton,
  KeyValueRow,
  MoneyText,
  Notice,
  SectionHeader,
  Skeleton,
  Text,
} from '@/shared/ui';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const SKELETON_ROWS = ['a', 'b'] as const;

interface RatesCardProps {
  rates: CreatorHomeScreenModel['rates'];
  onEdit: () => void;
}

/** "My rates": one line per saved price; prices are edited on the platform page. */
const RatesCardComponent: React.FC<RatesCardProps> = ({ rates, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hasRows = rates.rows.length > 0;

  const renderBody = () => {
    if (rates.isLoading) {
      return (
        <Card shadow="none" p="lg">
          <Box gap="md">
            {SKELETON_ROWS.map(key => (
              <Skeleton key={key} width="100%" height={sizes.icon.md} borderRadius="sm" />
            ))}
          </Box>
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
              onPress={onEdit}
              fullWidth
            />
          </Box>
        </Card>
      );
    }
    return (
      <Card shadow="none" px="lg" py="md">
        {rates.rows.map(row => (
          <KeyValueRow
            key={row.key}
            label={t('marketplace.creatorHome.rates.row', {
              platform: row.platformLabel,
              service: row.serviceLabel,
            })}
            value={<MoneyText value={row.price} />}
          />
        ))}
      </Card>
    );
  };

  return (
    <Box gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.rates.title')}
        action={
          hasRows ? { label: t('marketplace.creatorHome.rates.edit'), onPress: onEdit } : undefined
        }
      />
      {renderBody()}
    </Box>
  );
};

export const RatesCard = memo(RatesCardComponent);
