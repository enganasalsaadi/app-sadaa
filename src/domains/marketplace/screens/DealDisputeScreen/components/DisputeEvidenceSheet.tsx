import React, { memo, useCallback } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check, FilePlus2, ImagePlus, Link2, Plus, Send, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, IconButton, Image, Notice, Pressable, Text, SheetFrame } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import { DEAL_DISPUTE_LIMITS } from '../../../constants/dealDispute';
import type { DealShipmentPhotoRef } from '../../../utils/dealDispute';
import type { DisputeEvidenceModel, EvidenceSource } from '../hooks/useDisputeEvidence';
import { useEvidenceFiles } from '../hooks/useEvidenceFiles';
import { EVIDENCE_DRAFT_TILE, EvidenceDraftTile } from './EvidenceDraftTile';

const HIT = moderateScale(8);

export interface DisputeEvidenceSheetProps {
  evidence: DisputeEvidenceModel;
}

const AddTile = memo<{ source: EvidenceSource; icon: LucideIcon; label: string; onPick: (source: EvidenceSource) => void }>(
  ({ source, icon: Icon, label, onPick }) => {
    const { colors, sizes } = useTheme();
    const styles = useStyles(
      ({ radii, spacing, borderWidths }): Record<'tile', ViewStyle> => ({
        tile: {
          width: EVIDENCE_DRAFT_TILE,
          height: EVIDENCE_DRAFT_TILE,
          borderRadius: radii.lg,
          borderWidth: borderWidths.md,
          borderStyle: 'dashed',
          borderColor: colors.interactive.main,
          backgroundColor: colors.interactive.soft,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          padding: spacing.sm,
        },
      }),
      [colors.interactive.main, colors.interactive.soft],
    );
    const onPress = useCallback(() => onPick(source), [onPick, source]);
    return (
      <Pressable style={styles.tile} onPress={onPress} scaleOnPress accessibilityRole="button" accessibilityLabel={label}>
        <Icon size={sizes.icon.md} color={colors.interactive.main} />
        <Text variant="caption" color={colors.interactive.text} align="center" numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

const LinkPill = memo<{ link: string; onRemove: (link: string) => void }>(({ link, onRemove }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const remove = useCallback(() => onRemove(link), [link, onRemove]);
  const styles = useStyles((): Record<'text', TextStyle> => ({ text: { flexShrink: 1 } }), []);
  return (
    <Box row align="center" gap="xs" ps="sm" pe="xs" py="xs" bg={colors.interactive.soft} borderRadius="full">
      <Link2 size={sizes.icon.xs} color={colors.interactive.main} />
      <Text variant="caption" color={colors.interactive.text} numberOfLines={1} style={styles.text}>
        {isolateLtr(link.replace(/^https:\/\//i, ''))}
      </Text>
      <Pressable
        onPress={remove}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.deals.dispute.evidence.removeLink', { link })}
      >
        <X size={sizes.icon.xs} color={colors.interactive.text} />
      </Pressable>
    </Box>
  );
});

const CourierPhoto = memo<{ photo: DealShipmentPhotoRef; on: boolean; index: number; onToggle: (key: string) => void }>(
  ({ photo, on, index, onToggle }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const toggle = useCallback(() => onToggle(photo.key), [onToggle, photo.key]);
    const styles = useStyles(
      ({ radii, spacing, borderWidths }): Record<'tile' | 'mark', ViewStyle> => ({
        tile: {
          width: EVIDENCE_DRAFT_TILE,
          height: EVIDENCE_DRAFT_TILE,
          borderRadius: radii.lg,
          overflow: 'hidden',
          borderWidth: borderWidths.lg,
          borderColor: on ? colors.interactive.main : colors.layout.base,
        },
        mark: {
          position: 'absolute',
          top: spacing.xs,
          end: spacing.xs,
          width: sizes.icon.md,
          height: sizes.icon.md,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: on ? colors.interactive.main : colors.overlay,
        },
      }),
      [colors.interactive.main, colors.layout.base, colors.overlay, on, sizes.icon.md],
    );
    return (
      <Pressable
        style={styles.tile}
        onPress={toggle}
        scaleOnPress
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on }}
        accessibilityLabel={t('marketplace.deals.dispute.evidence.photoA11y', { index: formatNumber(index) })}
      >
        <Image uri={photo.url} width={EVIDENCE_DRAFT_TILE} height={EVIDENCE_DRAFT_TILE} resizeMode="cover" />
        <Box style={styles.mark}>{on ? <Check size={sizes.icon.xs} color={colors.text.onAccent} /> : null}</Box>
      </Pressable>
    );
  },
);

/**
 * One evidence entry (M9): the note first (required), then files, links and the courier's issue
 * photos already on the deal. Sent pieces stay; the sheet says so above the button.
 */
const DisputeEvidenceSheetComponent: React.FC<DisputeEvidenceSheetProps> = ({ evidence }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const files = useEvidenceFiles(evidence.uploads.entries);
  const canPick = files.length < evidence.fileRoom;
  const canLink = evidence.links.length < evidence.linkRoom;

  return (
    <SheetFrame
      visible={evidence.visible}
      onClose={evidence.close}
      title={t('marketplace.deals.dispute.evidence.title')}
      body={t('marketplace.deals.dispute.evidence.body')}
      footer={
        <CustomButton
          title={t('marketplace.deals.dispute.evidence.submit')}
          size="lg"
          fullWidth
          loading={evidence.sending}
          leftIcon={<Send size={sizes.icon.sm} color={colors.button.primary.text} />}
          onPress={evidence.onSubmit}
        />
      }
    >
      <Controller
        control={evidence.control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.dispute.evidence.noteLabel')}
            placeholder={t('marketplace.deals.dispute.evidence.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            showCount
            maxLength={DEAL_DISPUTE_LIMITS.maxNote}
            error={fieldState.error?.message}
          />
        )}
      />

      <Box gap="sm">
        <Box row align="center" justify="space-between">
          <Text variant="label" color={colors.text.secondary}>
            {t('marketplace.deals.dispute.evidence.filesLabel')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.dispute.evidence.filesCount', {
              value: formatNumber(files.length),
              max: formatNumber(evidence.fileRoom),
            })}
          </Text>
        </Box>
        <Box row wrap gap="sm">
          {files.map(file => (
            <EvidenceDraftTile
              key={file.key}
              file={file}
              onRemove={evidence.uploads.remove}
              onRetry={evidence.uploads.retry}
            />
          ))}
          {canPick ? (
            <>
              <AddTile
                source="media"
                icon={ImagePlus}
                label={t('marketplace.deals.dispute.evidence.addMedia')}
                onPick={evidence.pickFrom}
              />
              <AddTile
                source="files"
                icon={FilePlus2}
                label={t('marketplace.deals.dispute.evidence.addFiles')}
                onPick={evidence.pickFrom}
              />
            </>
          ) : null}
        </Box>
        <Text variant="caption" color={evidence.filesError ? colors.status.danger.text : colors.text.tertiary}>
          {evidence.filesError ?? t('marketplace.deals.dispute.evidence.filesHint')}
        </Text>
      </Box>

      <Box gap="sm">
        <Box row align="flex-start" gap="sm">
          <Box flex={1}>
            <Controller
              control={evidence.control}
              name="link"
              render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
                <CustomInput
                  ref={ref}
                  label={t('marketplace.deals.dispute.evidence.linkLabel')}
                  placeholder={t('marketplace.deals.dispute.evidence.linkPlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="URL"
                  returnKeyType="done"
                  onSubmitEditing={evidence.addLink}
                  editable={canLink}
                  maxLength={DEAL_DISPUTE_LIMITS.maxUrl}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Box>
          <Box pt="xl">
            <IconButton
              icon={Plus}
              variant="soft"
              disabled={!canLink}
              accessibilityLabel={t('marketplace.deals.dispute.evidence.addLink')}
              onPress={evidence.addLink}
            />
          </Box>
        </Box>
        {evidence.links.length > 0 ? (
          <Box row wrap gap="xs">
            {evidence.links.map(link => (
              <LinkPill key={link} link={link} onRemove={evidence.removeLink} />
            ))}
          </Box>
        ) : null}
      </Box>

      {evidence.photos.length > 0 ? (
        <Box gap="sm">
          <Text variant="label" color={colors.text.secondary}>
            {t('marketplace.deals.dispute.evidence.photosLabel')}
          </Text>
          <Box row wrap gap="sm">
            {evidence.photos.map((photo, index) => (
              <CourierPhoto
                key={photo.key}
                photo={photo}
                index={index + 1}
                on={evidence.picked.includes(photo.key)}
                onToggle={evidence.togglePhoto}
              />
            ))}
          </Box>
        </Box>
      ) : null}

      <Notice tone="info" message={t('marketplace.deals.dispute.evidence.final')} />
    </SheetFrame>
  );
};

export const DisputeEvidenceSheet = memo(DisputeEvidenceSheetComponent);
