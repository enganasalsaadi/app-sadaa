import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text, TierBadge } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';

/** Identity pinned in the navy bar once the hero scrolls away: photo, name, seal, tier crest. */
const MediaKitHeaderBarComponent: React.FC<{ kit: PublicMediaKit }> = ({ kit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));

  return (
    <Box row align="center" gap="sm" minHeight={sizes.iconButton.md}>
      {kit.avatar_url ? <Image uri={kit.avatar_url} size={sizes.avatar.sm} circle /> : null}
      <Box style={styles.shrink}>
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
          {kit.display_name ?? kit.slug}
        </Text>
      </Box>
      {kit.is_verified ? (
        <BadgeCheck
          size={sizes.icon.sm}
          color={colors.premium.main}
          accessibilityLabel={t('account.mediaKit.verifiedCreator')}
        />
      ) : null}
      {kit.tier ? <TierBadge tier={kit.tier} size="xs" interactive={false} /> : null}
    </Box>
  );
};

export const MediaKitHeaderBar = memo(MediaKitHeaderBarComponent);
