import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Flag, Link2, Send } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import {
  Box,
  CustomButton,
  CustomInput,
  GalleryModal,
  Notice,
  Text,
} from '@/shared/ui';
import {
  DEAL_RETENTION_LIMITS,
  DEAL_RETENTION_REASON_DEF,
  DEAL_RETENTION_REASONS,
} from '../constants/dealRetention';
import type { DealRetentionModel } from '../hooks/useDealRetention';
import type { RetentionShotsModel } from '../hooks/useRetentionShots';
import type { Deal } from '../types';
import { DealProofShots } from './DealProofShots';
import { DealReasonTiles } from './DealReasonTiles';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealRetentionSheetsProps {
  deal: Deal;
  retention: DealRetentionModel;
}

const Shots = memo<{ shots: RetentionShotsModel; hint: string }>(
  ({ shots, hint }) => {
    const { t } = useTranslation();
    return (
      <DealProofShots
        title={t('marketplace.deals.retention.shots.title')}
        hint={hint}
        frames={shots.frames}
        max={shots.max}
        error={shots.error}
        onAdd={shots.pick}
        onRemove={shots.remove}
        onRetry={shots.retry}
      />
    );
  },
);

/** The brand's report: what happened, a note, 1–3 screenshots, then a plain send. */
const ReportSheet = memo<DealRetentionSheetsProps>(({ deal, retention }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { report } = retention;
  const item = deal.items.find(entry => entry.id === report.itemId);
  return (
    <DealSheetFrame
      visible={report.visible}
      onClose={report.close}
      onDismissed={retention.onDismissed}
      title={t('marketplace.deals.retention.report.title')}
      body={t('marketplace.deals.retention.report.body', {
        name: retention.other,
        hours: formatNumber(DEAL_RETENTION_LIMITS.answerHours),
      })}
      footer={
        <CustomButton
          title={t('marketplace.deals.retention.report.send')}
          size="lg"
          fullWidth
          loading={report.sending}
          leftIcon={
            <Flag size={sizes.icon.sm} color={colors.button.primary.text} />
          }
          onPress={report.onSubmit}
        />
      }
    >
      {item ? (
        <Text variant="overline" color={colors.text.tertiary}>
          {item.title}
        </Text>
      ) : null}
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.deals.retention.report.reasonLabel')}
        </Text>
        <Controller
          control={report.control}
          name="reason"
          render={({ field: { value, onChange }, fieldState }) => (
            <DealReasonTiles
              reasons={DEAL_RETENTION_REASONS}
              defs={DEAL_RETENTION_REASON_DEF}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </Box>
      <Controller
        control={report.control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.retention.report.noteLabel')}
            placeholder={t(
              'marketplace.deals.retention.report.notePlaceholder',
            )}
            hint={t('marketplace.deals.retention.report.noteHint')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RETENTION_LIMITS.maxNote}
            error={fieldState.error?.message}
          />
        )}
      />
      <Shots
        shots={report.shots}
        hint={t('marketplace.deals.retention.report.shotsHint')}
      />
    </DealSheetFrame>
  );
});

/** The creator's restore: screenshots of the post live again (required) and the new link if it changed. */
const RestoreSheet = memo<DealRetentionSheetsProps>(({ retention }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { restore } = retention;
  return (
    <DealSheetFrame
      visible={restore.visible}
      onClose={restore.close}
      onDismissed={retention.onDismissed}
      title={t('marketplace.deals.retention.restore.title')}
      body={t('marketplace.deals.retention.restore.body')}
      footer={
        <Box gap="sm">
          <CustomButton
            title={t('marketplace.deals.retention.restore.send', {
              name: retention.other,
            })}
            size="lg"
            fullWidth
            loading={restore.sending}
            leftIcon={
              <Send size={sizes.icon.sm} color={colors.button.primary.text} />
            }
            onPress={restore.onSubmit}
          />
          <CustomButton
            title={t('marketplace.deals.retention.restore.contestInstead')}
            variant="ghost"
            size="md"
            fullWidth
            disabled={restore.sending}
            onPress={retention.restoreToContest}
          />
        </Box>
      }
    >
      <Controller
        control={restore.control}
        name="url"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.retention.restore.urlLabel')}
            placeholder={t(
              'marketplace.deals.retention.restore.urlPlaceholder',
            )}
            hint={t('marketplace.deals.retention.restore.urlHint')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            returnKeyType="done"
            maxLength={DEAL_RETENTION_LIMITS.maxUrl}
            leftIcon={
              <Link2 size={sizes.icon.sm} color={colors.icon.secondary} />
            }
            error={fieldState.error?.message}
          />
        )}
      />
      <Shots
        shots={restore.shots}
        hint={t('marketplace.deals.retention.restore.shotsHint')}
      />
    </DealSheetFrame>
  );
});

/** The note that sends a case to the team: the creator's contest or the brand's rejection. */
const NoteSheet = memo<DealRetentionSheetsProps>(({ retention }) => {
  const { t } = useTranslation();
  const { note } = retention;
  const brand = retention.role === 'brand';
  return (
    <DealSheetFrame
      visible={note.visible}
      onClose={note.close}
      onDismissed={retention.onDismissed}
      title={t(
        brand
          ? 'marketplace.deals.retention.reject.title'
          : 'marketplace.deals.retention.contest.title',
      )}
      body={t(
        brand
          ? 'marketplace.deals.retention.reject.body'
          : 'marketplace.deals.retention.contest.body',
      )}
      footer={
        <CustomButton
          title={t(
            brand
              ? 'marketplace.deals.retention.reject.send'
              : 'marketplace.deals.retention.contest.send',
          )}
          variant="danger"
          size="lg"
          fullWidth
          loading={note.sending}
          onPress={note.onSubmit}
        />
      }
    >
      {brand ? null : (
        <Notice
          tone="warning"
          message={t('marketplace.deals.retention.contest.warning')}
        />
      )}
      <Controller
        control={note.control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t(
              brand
                ? 'marketplace.deals.retention.reject.noteLabel'
                : 'marketplace.deals.retention.contest.noteLabel',
            )}
            placeholder={t(
              brand
                ? 'marketplace.deals.retention.reject.notePlaceholder'
                : 'marketplace.deals.retention.contest.notePlaceholder',
            )}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={5}
            showCount
            maxLength={DEAL_RETENTION_LIMITS.maxNote}
            error={fieldState.error?.message}
          />
        )}
      />
    </DealSheetFrame>
  );
});

/** Retention's sheets and screenshot viewer, over the deal page (P9.2). */
const DealRetentionSheetsComponent: React.FC<DealRetentionSheetsProps> = ({
  deal,
  retention,
}) => (
  <>
    {retention.role === 'brand' ? (
      <ReportSheet deal={deal} retention={retention} />
    ) : null}
    {retention.role === 'creator' ? (
      <RestoreSheet deal={deal} retention={retention} />
    ) : null}
    <NoteSheet deal={deal} retention={retention} />
    <GalleryModal
      images={retention.galleryImages}
      visible={retention.galleryIndex !== null}
      initialIndex={retention.galleryIndex ?? 0}
      onClose={retention.closeGallery}
    />
  </>
);

export const DealRetentionSheets = memo(DealRetentionSheetsComponent);
