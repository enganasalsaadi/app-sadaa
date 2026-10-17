import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, X } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, FormSection, Image, Pressable, Text } from '@/shared/ui';
import type { DealIssuePhoto } from '../hooks/useIssuePhotos';

const SLOT = moderateScale(58);
const REMOVE = moderateScale(24);

export interface DealPhotoSlotsProps {
  photos: readonly DealIssuePhoto[];
  max: number;
  /** The tag next to the title: «required» or «optional». */
  required: boolean;
  /** Under the title; the shipping report's evidence line by default. */
  hint?: string;
  error: string | null;
  onPick: () => void;
  onRemove: (key: string) => void;
}

/** Picked photos (tap ✕ to drop one), the add slot, and the empty slots up to the cap. */
const DealPhotoSlotsComponent: React.FC<DealPhotoSlotsProps> = ({
  photos,
  max,
  required,
  hint,
  error,
  onPick,
  onRemove,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'slot' | 'add' | 'empty' | 'remove', ViewStyle> => {
      const slot: ViewStyle = { width: SLOT, height: SLOT, borderRadius: radii.md };
      return {
        slot,
        add: {
          ...slot,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: borderWidths.sm,
          borderStyle: 'dashed',
          borderColor: colors.interactive.main,
          backgroundColor: colors.interactive.soft,
        },
        empty: {
          ...slot,
          borderWidth: borderWidths.sm,
          borderStyle: 'dashed',
          borderColor: colors.border.default,
        },
        remove: {
          position: 'absolute',
          top: -REMOVE / 3,
          end: -REMOVE / 3,
          width: REMOVE,
          height: REMOVE,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.text.primary,
        },
      };
    },
    [colors],
  );
  const empties = Math.max(0, max - photos.length - 1);
  return (
    <FormSection
      title={t('marketplace.deals.shipping.issue.photos')}
      tag={required ? t('marketplace.deals.shipping.issue.required') : t('marketplace.deals.shipping.issue.optional')}
      description={hint ?? t('marketplace.deals.shipping.issue.photosHint')}
      error={error ?? undefined}
    >
      <Box row gap="sm" wrap>
        {photos.map((photo, index) => (
          <Box key={photo.key} style={styles.slot}>
            <Image uri={photo.uri} width={SLOT} height={SLOT} borderRadius="md" resizeMode="cover" />
            <Pressable
              style={styles.remove}
              hitSlop={sizes.hitSlop.md}
              onPress={() => onRemove(photo.key)}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.deals.shipping.issue.removePhoto', {
                number: formatNumber(index + 1, {}, i18n.language),
              })}
            >
              <X size={sizes.icon.xs} color={colors.surface.main} />
            </Pressable>
          </Box>
        ))}
        {photos.length < max ? (
          <Pressable
            style={styles.add}
            scaleOnPress
            onPress={onPick}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.deals.shipping.issue.addPhoto')}
          >
            <Camera size={sizes.icon.sm} color={colors.interactive.main} />
            <Text variant="caption" color={colors.interactive.text}>
              {t('marketplace.deals.shipping.issue.add')}
            </Text>
          </Pressable>
        ) : null}
        {Array.from({ length: empties }, (_, index) => (
          <Box key={`empty-${index}`} style={styles.empty} />
        ))}
      </Box>
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.deals.shipping.issue.count', {
          number: formatNumber(photos.length, {}, i18n.language),
          max: formatNumber(max, {}, i18n.language),
        })}
      </Text>
    </FormSection>
  );
};

export const DealPhotoSlots = memo(DealPhotoSlotsComponent);
