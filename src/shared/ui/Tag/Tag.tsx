import React, { memo, useCallback } from 'react';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export type TagTone = 'neutral' | 'brand' | 'premium';

export interface TagProps {
  label: string;
  tone?: TagTone;
  /** Shows a remove button; receives the tag's `label`. */
  onRemove?: (label: string) => void;
}

/** Small label (niche, city, skill). Not pressable on its own — selectable options are `Chip`s. */
const TagComponent: React.FC<TagProps> = ({ label, tone = 'neutral', onRemove }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, tone);
  const handleRemove = useCallback(() => onRemove?.(label), [onRemove, label]);

  return (
    <Box
      row
      align="center"
      alignSelf="flex-start"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="sm"
      bg={hue.soft}
    >
      <Text variant="caption" color={hue.text}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={handleRemove}
          hitSlop={sizes.hitSlop.lg}
          accessibilityRole="button"
          accessibilityLabel={t('common.removeItem', { label })}
        >
          <X size={sizes.icon.xs} color={hue.main} strokeWidth={iconStroke.bold} />
        </Pressable>
      ) : null}
    </Box>
  );
};

export const Tag = memo(TagComponent);
