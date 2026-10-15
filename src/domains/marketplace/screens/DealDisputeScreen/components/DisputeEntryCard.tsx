import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link2 } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import type { DealDisputeEntry, DealFile, DealFilePurpose } from '../../../types';
import { EvidenceTile, type EvidenceTileKind } from './EvidenceTile';

const TIME_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

const PURPOSE_BADGE: Partial<Record<DealFilePurpose, ParseKeys>> = {
  draft: 'marketplace.deals.dispute.file.refDraft',
  proof: 'marketplace.deals.dispute.file.refProof',
  brief: 'marketplace.deals.dispute.file.refBrief',
};

const tileKind = (file: DealFile | null): EvidenceTileKind => {
  if (!file || file.url === null || file.status === 'purged') return 'gone';
  return file.kind ?? 'document';
};

export interface DisputeEntryCardProps {
  entry: DealDisputeEntry;
  /** The viewer's own entry leans to the start, the other side's to the end. */
  mine: boolean;
  name: string;
  onOpenMedia: (key: string) => void;
  onLink: (link: string) => void;
}

const LinkChip = memo<{ link: string; onLink: (link: string) => void }>(({ link, onLink }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const onPress = useCallback(() => onLink(link), [link, onLink]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={t('marketplace.deals.dispute.file.linkA11y', { link })}
    >
      <Box row align="center" gap="xs" px="sm" py="xs" bg={colors.surface.elevated} borderRadius="md">
        <Link2 size={sizes.icon.xs} color={colors.interactive.main} />
        <Text variant="caption" color={colors.text.link} numberOfLines={1}>
          {isolateLtr(link.replace(/^https:\/\//i, ''))}
        </Text>
      </Box>
    </Pressable>
  );
});

/** One evidence entry: who and when, the note, links, own files and what it points at on the deal. */
const DisputeEntryCardComponent: React.FC<DisputeEntryCardProps> = ({ entry, mine, name, onOpenMedia, onLink }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        width: '86%',
        alignSelf: mine ? 'flex-start' : 'flex-end',
        padding: spacing.md,
        gap: spacing.sm,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        ...(mine
          ? { borderStartWidth: borderWidths.lg, borderStartColor: colors.interactive.main }
          : { borderEndWidth: borderWidths.lg, borderEndColor: colors.border.strong }),
      },
    }),
    [colors.border.strong, colors.interactive.main, colors.surface.main, mine],
  );
  const hasMedia = entry.files.length > 0 || entry.refs.length > 0;

  return (
    <Box style={styles.card} shadow="card">
      <Box row align="center" gap="sm">
        <Text variant="label" color={colors.text.primary} numberOfLines={1}>
          {name}
        </Text>
        <Box flex={1} />
        {entry.createdAt ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {formatDate(entry.createdAt, TIME_FORMAT, i18n.language)}
          </Text>
        ) : null}
      </Box>
      {entry.note ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {entry.note}
        </Text>
      ) : null}
      {entry.links.length > 0 ? (
        <Box row gap="xs" wrap>
          {entry.links.map(link => (
            <LinkChip key={link} link={link} onLink={onLink} />
          ))}
        </Box>
      ) : null}
      {hasMedia ? (
        <Box row gap="xs" wrap>
          {entry.files.map(file => (
            <EvidenceTile
              key={file.id}
              tileKey={file.id}
              kind={tileKind(file)}
              url={file.url}
              onOpen={onOpenMedia}
              accessibilityLabel={file.name}
            />
          ))}
          {entry.refs.map((ref, index) => {
            const key = `${entry.id}:ref:${index}`;
            if (ref.type === 'file') {
              const badge = ref.purpose ? PURPOSE_BADGE[ref.purpose] : undefined;
              return (
                <EvidenceTile
                  key={key}
                  tileKey={key}
                  kind={tileKind(ref.file)}
                  url={ref.file?.url ?? null}
                  badge={badge ? t(badge) : undefined}
                  onOpen={onOpenMedia}
                  accessibilityLabel={ref.file?.name ?? t('marketplace.deals.dispute.file.gone')}
                />
              );
            }
            return (
              <EvidenceTile
                key={key}
                tileKey={key}
                kind={ref.url ? 'image' : 'gone'}
                url={ref.url}
                badge={t('marketplace.deals.dispute.file.refShipment')}
                onOpen={onOpenMedia}
                accessibilityLabel={t('marketplace.deals.dispute.file.refShipment')}
              />
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export const DisputeEntryCard = memo(DisputeEntryCardComponent);
