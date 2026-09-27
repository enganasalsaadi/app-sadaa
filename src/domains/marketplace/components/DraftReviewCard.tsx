import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, MediaTile, Notice, StatusPill, Text } from '@/shared/ui';
import type { MediaKind } from '@/shared/ui';
import { DRAFT_STATUS_ICON, DRAFT_STATUS_META } from '../constants';
import type { DraftStatus } from '../types';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export interface DraftReviewCardProps {
  version: number;
  /** Epoch ms. */
  submittedAt: number;
  media: { uri?: string; kind: MediaKind; durationSeconds?: number };
  status: DraftStatus;
  /** Brand feedback on a `changes_requested` draft. Shown as-is (server text). */
  note?: string;
  /** Opens the original-quality viewer. */
  onOpen: () => void;
  /** Review actions show only while the draft is pending and the viewer may act (`getDealActions`). */
  onApprove?: () => void;
  onRequestChanges?: () => void;
  /** An approve / request-changes call is in flight: locks both buttons. */
  submitting?: boolean;
}

/** One uploaded draft in a deal: media, version, review state and the brand's actions. */
const DraftReviewCardComponent: React.FC<DraftReviewCardProps> = ({
  version,
  submittedAt,
  media,
  status,
  note,
  onOpen,
  onApprove,
  onRequestChanges,
  submitting = false,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const meta = DRAFT_STATUS_META[status];
  const title = t('marketplace.draft.version', { version: formatNumber(version) });
  const canReview = status === 'pending_review' && onApprove && onRequestChanges;

  return (
    <Card>
      <Box gap="md">
        <Box row gap="md">
          <Box width={sizes.thumbnail.lg}>
            <MediaTile
              uri={media.uri}
              kind={media.kind}
              durationSeconds={media.durationSeconds}
              onPress={onOpen}
              accessibilityLabel={t('marketplace.draft.open', { title })}
            />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title">{title}</Text>
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.draft.submittedAt', { date: formatDate(submittedAt, DATE_FORMAT, i18n.language) })}
            </Text>
            <Box mt="xs">
              <StatusPill label={t(meta.labelKey)} tone={meta.tone} icon={DRAFT_STATUS_ICON[status]} size="sm" />
            </Box>
          </Box>
        </Box>

        {note && status === 'changes_requested' ? (
          <Notice tone="warning" title={t('marketplace.draft.noteTitle')} message={note} />
        ) : null}

        {canReview ? (
          <Box row gap="sm">
            <Box flex={1}>
              <CustomButton
                title={t('marketplace.draft.requestChanges')}
                variant="secondary"
                onPress={onRequestChanges}
                disabled={submitting}
                fullWidth
              />
            </Box>
            <Box flex={1}>
              <CustomButton
                title={t('marketplace.draft.approve')}
                onPress={onApprove}
                loading={submitting}
                fullWidth
              />
            </Box>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const DraftReviewCard = memo(DraftReviewCardComponent);
