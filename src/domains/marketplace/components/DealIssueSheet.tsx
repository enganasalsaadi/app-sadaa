import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Camera, X } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, FormSection, Image, Pressable, Text } from '@/shared/ui';
import { DEAL_ISSUE_REASON_DEF, DEAL_ISSUE_REASON_ORDER, DEAL_SHIPPING_LIMITS } from '../constants/dealShipping';
import type { DealIssuePhoto } from '../hooks/useDealShipping';
import { issueNeedsPhotos, type DealIssueFormValues } from '../schemas/dealShippingSchema';
import type { DealShippingIssueReason } from '../types';
import { DealSheetFrame } from './DealSheetFrame';

const TILE_HEIGHT = moderateScale(80);
const SLOT = moderateScale(58);
const REMOVE = moderateScale(24);

export interface DealIssueSheetProps {
  visible: boolean;
  onClose: () => void;
  control: Control<DealIssueFormValues>;
  brandName: string;
  /** Whole days until «delayed» can be reported; 0 = it can. */
  delayedIn: number;
  photos: readonly DealIssuePhoto[];
  photosError: string | null;
  onPickPhotos: () => void;
  onRemovePhoto: (key: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

/** One reason tile: icon over label; «delayed» stays locked (with when it opens) before its day. */
const ReasonTile = memo<{
  reason: DealShippingIssueReason;
  selected: boolean;
  lockedIn: number;
  onPick: (reason: DealShippingIssueReason) => void;
}>(({ reason, selected, lockedIn, onPick }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const def = DEAL_ISSUE_REASON_DEF[reason];
  const Icon = def.icon;
  const locked = lockedIn > 0;
  const styles = useStyles(
    ({ radii, borderWidths, spacing }): Record<'tile', ViewStyle> => ({
      tile: {
        width: moderateScale(170),
        minHeight: TILE_HEIGHT,
        padding: spacing.sm,
        gap: spacing.xs,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: borderWidths.sm,
        borderColor: selected ? colors.interactive.main : colors.border.default,
        backgroundColor: selected ? colors.interactive.soft : colors.surface.main,
      },
    }),
    [colors, selected],
  );
  return (
    <Pressable
      style={styles.tile}
      scaleOnPress
      disabled={locked}
      activeOpacity={locked ? 1 : undefined}
      onPress={() => onPick(reason)}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: locked }}
      accessibilityLabel={t(def.label)}
    >
      <Icon
        size={sizes.icon.md}
        color={locked ? colors.icon.disabled : selected ? colors.interactive.main : colors.text.secondary}
      />
      <Text
        variant="buttonSmall"
        align="center"
        color={locked ? colors.text.tertiary : selected ? colors.interactive.text : colors.text.primary}
        numberOfLines={1}
      >
        {t(def.label)}
      </Text>
      {locked ? (
        <Text variant="caption" color={colors.text.tertiary} align="center" numberOfLines={1}>
          {t('marketplace.deals.shipping.issue.lockedIn', { count: lockedIn })}
        </Text>
      ) : null}
    </Pressable>
  );
});

/** Picked photos (tap ✕ to drop one), the add slot, and the empty slots up to five. */
const PhotoSlots = memo<{
  control: Control<DealIssueFormValues>;
  photos: readonly DealIssuePhoto[];
  error: string | null;
  onPick: () => void;
  onRemove: (key: string) => void;
}>(({ control, photos, error, onPick, onRemove }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const reason = useWatch({ control, name: 'reason' });
  const required = issueNeedsPhotos(reason);
  const max = DEAL_SHIPPING_LIMITS.issuePhotos;
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
      description={t('marketplace.deals.shipping.issue.photosHint')}
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
});

/** The note's tag follows the reason: required for «other». Watches `reason` alone. */
const NoteField = memo<{ control: Control<DealIssueFormValues> }>(({ control }) => {
  const { t } = useTranslation();
  const reason = useWatch({ control, name: 'reason' });
  return (
    <Controller
      control={control}
      name="note"
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <CustomInput
          ref={ref}
          label={
            reason === 'other'
              ? t('marketplace.deals.shipping.issue.note')
              : t('marketplace.deals.shipping.issue.noteOptional')
          }
          placeholder={t('marketplace.deals.shipping.issue.notePlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          multiline
          numberOfLines={3}
          showCount
          maxLength={DEAL_SHIPPING_LIMITS.issueNote}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

/**
 * «What's wrong?» (M5): pick a reason (damaged / incomplete / wrong item need photos; «delayed»
 * opens on the server's date), add 1–5 photos (they become dispute evidence), a note. Sending
 * pauses every deal timer until the brand re-ships or cancels.
 */
const DealIssueSheetComponent: React.FC<DealIssueSheetProps> = ({
  visible,
  onClose,
  control,
  brandName,
  delayedIn,
  photos,
  photosError,
  onPickPhotos,
  onRemovePhoto,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.shipping.issue.title')}
      body={t('marketplace.deals.shipping.issue.body', { name: brandName })}
      footer={
        <CustomButton
          title={t('marketplace.deals.shipping.issue.submit')}
          size="lg"
          fullWidth
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <Controller
        control={control}
        name="reason"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection
            title={t('marketplace.deals.shipping.issue.reason')}
            error={fieldState.error?.message}
          >
            <Box row wrap gap="sm" accessibilityRole="radiogroup">
              {DEAL_ISSUE_REASON_ORDER.map(reason => (
                <ReasonTile
                  key={reason}
                  reason={reason}
                  selected={value === reason}
                  lockedIn={reason === 'delayed' ? delayedIn : 0}
                  onPick={onChange}
                />
              ))}
            </Box>
          </FormSection>
        )}
      />
      <PhotoSlots
        control={control}
        photos={photos}
        error={photosError}
        onPick={onPickPhotos}
        onRemove={onRemovePhoto}
      />
      <NoteField control={control} />
    </DealSheetFrame>
  );
};

export const DealIssueSheet = memo(DealIssueSheetComponent);
