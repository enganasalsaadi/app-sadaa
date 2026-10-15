import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealRole } from '../types';

const STUB = moderateScale(92);

export interface DealDossierTagsProps {
  hashtags: string[];
  mentions: string[];
  promoCode: string | null;
  trackingLink: string | null;
  role: DealRole;
  onCopy: (value: string) => void;
}

const TagChip = memo<{
  value: string;
  tone: 'hashtag' | 'mention';
  onCopy: (value: string) => void;
}>(({ value, tone, onCopy }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const hue = tone === 'hashtag' ? colors.interactive : colors.brand;
  const onPress = useCallback(() => onCopy(value), [onCopy, value]);
  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      px="md"
      py="sm"
      borderRadius="lg"
      bg={hue.soft}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.dossier.copyValue', { value })}
    >
      <Text variant="buttonSmall" color={hue.text} writingDirection="ltr">
        {value}
      </Text>
    </Pressable>
  );
});

/**
 * Everything the creator pastes into the post: hashtags (teal) and mentions (navy) as tap-to-copy
 * chips, the promo code as a coupon with a copy stub, and the tracking link.
 */
const DealDossierTagsComponent: React.FC<DealDossierTagsProps> = ({
  hashtags,
  mentions,
  promoCode,
  trackingLink,
  role,
  onCopy,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'coupon' | 'code' | 'stub' | 'link', ViewStyle> => ({
      coupon: {
        flexDirection: 'row',
        borderRadius: radii.xl,
        overflow: 'hidden',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      code: {
        flex: 1,
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderEndWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
      stub: {
        width: STUB,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: colors.button.primary.bg,
      },
      link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radii.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [
      colors.border.card,
      colors.border.default,
      colors.button.primary.bg,
      colors.surface.main,
    ],
  );
  const copyCode = useCallback(() => {
    if (promoCode) onCopy(promoCode);
  }, [onCopy, promoCode]);
  const copyLink = useCallback(() => {
    if (trackingLink) onCopy(trackingLink);
  }, [onCopy, trackingLink]);
  const hasTags = hashtags.length + mentions.length > 0;

  return (
    <Box gap="md">
      {hasTags ? (
        <Box gap="sm">
          <Box row wrap gap="sm">
            {hashtags.map(tag => (
              <TagChip key={tag} value={tag} tone="hashtag" onCopy={onCopy} />
            ))}
            {mentions.map(mention => (
              <TagChip
                key={mention}
                value={mention}
                tone="mention"
                onCopy={onCopy}
              />
            ))}
          </Box>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.dossier.tapToCopy')}
          </Text>
        </Box>
      ) : null}

      {promoCode ? (
        <Pressable
          onPress={copyCode}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.dossier.copyValue', {
            value: promoCode,
          })}
        >
          <Box style={styles.coupon}>
            <Box style={styles.code}>
              <Text variant="caption" color={colors.text.tertiary}>
                {t(
                  role === 'brand'
                    ? 'marketplace.deals.dossier.promo'
                    : 'marketplace.deals.dossier.promoCreator',
                )}
              </Text>
              <Text
                variant="h3"
                color={colors.text.primary}
                writingDirection="ltr"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {promoCode}
              </Text>
            </Box>
            <Box style={styles.stub}>
              <Copy size={sizes.icon.sm} color={colors.button.primary.text} />
              <Text variant="buttonSmall" color={colors.button.primary.text}>
                {t('marketplace.deals.dossier.copy')}
              </Text>
            </Box>
          </Box>
        </Pressable>
      ) : null}

      {trackingLink ? (
        <Pressable
          onPress={copyLink}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.dossier.copyValue', {
            value: t('marketplace.deals.dossier.link'),
          })}
        >
          <Box style={styles.link}>
            <Box flex={1} gap="xs">
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.dossier.link')}
              </Text>
              <Text
                variant="bodySmall"
                color={colors.interactive.text}
                writingDirection="ltr"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {trackingLink}
              </Text>
            </Box>
            <Box
              row
              align="center"
              gap="xs"
              px="sm"
              py="xs"
              borderRadius="md"
              bg={colors.interactive.soft}
            >
              <Copy size={sizes.icon.xs} color={colors.interactive.main} />
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {t('marketplace.deals.dossier.copy')}
              </Text>
            </Box>
          </Box>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const DealDossierTags = memo(DealDossierTagsComponent);
