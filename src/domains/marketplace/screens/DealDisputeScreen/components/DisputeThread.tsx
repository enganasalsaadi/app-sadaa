import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealDisputeEntry, DealRole } from '../../../types';
import { isOwnParty } from '../../../utils/dealDispute';
import { DisputeEntryCard } from './DisputeEntryCard';

export interface DisputeThreadProps {
  entries: DealDisputeEntry[];
  role: DealRole;
  /** The other party's name (already bidi-isolated). */
  other: string;
  onOpenMedia: (key: string) => void;
  onLink: (link: string) => void;
}

/**
 * Both sides' evidence on one spine, like the two pans: the viewer's entries lean to the start,
 * the other party's to the end, in the order they came in.
 */
const DisputeThreadComponent: React.FC<DisputeThreadProps> = ({ entries, role, other, onOpenMedia, onLink }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'spine', ViewStyle> => ({
      spine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: '50%',
        width: borderWidths.md,
        backgroundColor: colors.border.default,
      },
    }),
    [colors.border.default],
  );

  return (
    <Box gap="md">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.dispute.file.thread', { count: entries.length, value: formatNumber(entries.length) })}
      </Text>
      {entries.length === 0 ? (
        <Box align="center" gap="sm" py="xl" px="lg" bg={colors.surface.main} borderRadius="xl">
          <Scale size={sizes.icon.lg} color={colors.icon.secondary} />
          <Text variant="bodySmall" color={colors.text.secondary} align="center">
            {t('marketplace.deals.dispute.file.threadEmpty')}
          </Text>
        </Box>
      ) : (
        <Box gap="md" py="xs">
          <Box style={styles.spine} />
          {entries.map(entry => {
            const mine = isOwnParty(entry.party, role);
            return (
              <DisputeEntryCard
                key={entry.id}
                entry={entry}
                mine={mine}
                name={mine ? t('marketplace.deals.dispute.file.you') : other}
                onOpenMedia={onOpenMedia}
                onLink={onLink}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export const DisputeThread = memo(DisputeThreadComponent);
