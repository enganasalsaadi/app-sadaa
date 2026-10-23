import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';

export interface VaultSectionHeaderProps {
  title: string;
  count: number;
  bytes: number;
  ids: readonly string[];
  /** Select mode: «select section» / «clear section» on the end. */
  selecting: boolean;
  allPicked: boolean;
  onToggleSection: (ids: readonly string[]) => void;
}

/** A section's pinned title (brief, drafts, proofs…) with its count and weight. */
const VaultSectionHeaderComponent: React.FC<VaultSectionHeaderProps> = ({
  title,
  count,
  bytes,
  ids,
  selecting,
  allPicked,
  onToggleSection,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const toggle = useCallback(() => onToggleSection(ids), [ids, onToggleSection]);
  const meta = t('marketplace.vault.sectionMeta', {
    files: t('marketplace.vault.files', { count }),
    size: formatFileSize(bytes),
  });

  return (
    <Box row align="center" justify="space-between" gap="md" pt="lg" pb="sm" bg={colors.layout.base}>
      <Box flex={1} accessible accessibilityRole="header" accessibilityLabel={`${title}، ${meta}`}>
        <Text variant="title">{title}</Text>
        <Text variant="caption" color={colors.text.secondary}>
          {meta}
        </Text>
      </Box>
      {selecting && ids.length > 0 ? (
        <Pressable
          onPress={toggle}
          minHeight={sizes.iconButton.md}
          justify="center"
          accessibilityRole="button"
          accessibilityLabel={allPicked ? t('marketplace.vault.select.sectionClear') : t('marketplace.vault.select.section')}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {allPicked ? t('marketplace.vault.select.sectionClear') : t('marketplace.vault.select.section')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const VaultSectionHeader = memo(VaultSectionHeaderComponent);
