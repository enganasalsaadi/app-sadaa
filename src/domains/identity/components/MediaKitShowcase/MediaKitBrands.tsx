import React, { memo, useCallback } from 'react';
import { FlatList, useWindowDimensions, type ListRenderItem } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { moderateScale, shadowBleed, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import type { MediaKitWorkedWith, MediaKitWorkedWithBrand } from '../../types/mediaKit';
import { MediaKitSectionTitle } from './MediaKitSectionTitle';

/** Each card takes this share of the screen width, so the next one peeks in and invites a swipe. */
const CARD_SHARE = 0.4;
const NAME_LINES = 2;
const LOGO = moderateScale(40);
const SEAL = moderateScale(16);

const keyOf = (brand: MediaKitWorkedWithBrand) => brand.id;

const BrandCard = memo<{ brand: MediaKitWorkedWithBrand; width: number }>(({ brand, width }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    () => ({ seal: { position: 'absolute' as const, bottom: -SEAL / 4, end: -SEAL / 4 } }),
    [],
  );
  const campaigns = t('account.mediaKit.showcase.workedWith.campaigns', { count: brand.completed_campaigns });
  return (
    <Box
      row
      align="center"
      gap="sm"
      width={width}
      flex={1}
      p="md"
      borderRadius="lg"
      bg={colors.surface.main}
      shadow="card"
      accessible
      accessibilityLabel={[brand.name, campaigns].join(t('account.mediaKit.showcase.listSeparator'))}
    >
      <Box>
        {brand.logo_url ? (
          <Image uri={brand.logo_url} size={LOGO} borderRadius="md" resizeMode="cover" />
        ) : (
          <Box width={LOGO} height={LOGO} borderRadius="md" bg={colors.brand.soft} align="center" justify="center">
            <Text variant="title" color={colors.brand.text}>
              {brand.name.trim().charAt(0).toUpperCase()}
            </Text>
          </Box>
        )}
        {brand.is_verified ? (
          <Box
            style={styles.seal}
            width={SEAL}
            height={SEAL}
            borderRadius="full"
            bg={colors.surface.main}
            align="center"
            justify="center"
          >
            <BadgeCheck size={sizes.icon.xs} color={colors.premium.main} />
          </Box>
        ) : null}
      </Box>
      <Box flex={1}>
        <Text variant="buttonSmall" numberOfLines={NAME_LINES}>
          {brand.name}
        </Text>
        <Text variant="caption" color={colors.interactive.text} numberOfLines={1}>
          {campaigns}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * "They trusted them": the brands this creator finished campaigns with in Sada, one still row
 * of wide cards that scrolls sideways, edge to edge: logo beside the full name and the number
 * of campaigns. The title carries the full count.
 */
const MediaKitBrandsComponent: React.FC<{ workedWith: MediaKitWorkedWith }> = ({ workedWith }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { spacing, shadows } = useTheme();
  const cardWidth = Math.round(width * CARD_SHARE);
  const styles = useStyles(
    () => {
      // The list clips: room inside for the cards' shadow, taken back off its margins.
      const room = shadowBleed(shadows.card);
      return {
        list: { flexGrow: 0, marginHorizontal: -spacing.xl, marginTop: -room.top, marginBottom: -room.bottom },
        content: { paddingHorizontal: spacing.xl, paddingTop: room.top, paddingBottom: room.bottom, gap: spacing.md },
      };
    },
    [spacing, shadows],
  );
  const renderItem = useCallback<ListRenderItem<MediaKitWorkedWithBrand>>(
    ({ item }) => <BrandCard brand={item} width={cardWidth} />,
    [cardWidth],
  );

  return (
    <Box gap="lg">
      <MediaKitSectionTitle
        overline={t('account.mediaKit.showcase.workedWith.overline')}
        title={t('account.mediaKit.showcase.workedWith.headline', { count: workedWith.total_brands })}
      />
      <FlatList
        horizontal
        data={workedWith.items}
        keyExtractor={keyOf}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.content}
        snapToInterval={cardWidth + spacing.md}
        decelerationRate="fast"
      />
    </Box>
  );
};

export const MediaKitBrands = memo(MediaKitBrandsComponent);
