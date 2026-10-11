import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Card, Image, Text } from '@/shared/ui';
import type { MediaKitWorkedWith, MediaKitWorkedWithBrand } from '../../types/mediaKit';
import { MediaKitRail } from './MediaKitRail';

const CARD_WIDTH = moderateScale(116);

const BrandCard = memo<{ brand: MediaKitWorkedWithBrand }>(({ brand }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const campaigns = t('account.mediaKit.showcase.workedWith.campaigns', { count: brand.completed_campaigns });

  return (
    <Card
      width={CARD_WIDTH}
      p="md"
      accessibilityLabel={[brand.name, campaigns].join(t('account.mediaKit.showcase.listSeparator'))}
    >
      <Box align="center" gap="sm">
        {brand.logo_url ? (
          <Image uri={brand.logo_url} size={sizes.avatar.md} circle resizeMode="contain" />
        ) : (
          <Box
            width={sizes.avatar.md}
            height={sizes.avatar.md}
            borderRadius="full"
            bg={colors.brand.soft}
            align="center"
            justify="center"
          >
            <Text variant="title" color={colors.brand.text}>
              {brand.name.trim().charAt(0).toUpperCase()}
            </Text>
          </Box>
        )}
        <Box row align="center" gap="xs" maxWidth="100%">
          <Box style={styles.shrink}>
            <Text variant="bodySmall" numberOfLines={1}>
              {brand.name}
            </Text>
          </Box>
          {brand.is_verified ? <BadgeCheck size={sizes.icon.xs} color={colors.premium.main} /> : null}
        </Box>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {campaigns}
        </Text>
      </Box>
    </Card>
  );
});

/**
 * Brands the creator has completed a campaign with inside Sada: social proof a brand can
 * trust because every one went through escrow. Hidden until there is at least one.
 */
const MediaKitWorkedWithRailComponent: React.FC<{ workedWith: MediaKitWorkedWith }> = ({ workedWith }) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <MediaKitRail
      title={t('account.mediaKit.showcase.workedWith.title')}
      subtitle={t('account.mediaKit.showcase.workedWith.subtitle', { count: workedWith.total_brands })}
      snapInterval={CARD_WIDTH + spacing.md}
    >
      {workedWith.items.map(brand => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </MediaKitRail>
  );
};

export const MediaKitWorkedWithRail = memo(MediaKitWorkedWithRailComponent);
