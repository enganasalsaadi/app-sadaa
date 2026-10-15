import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Pressable, Text } from '@/shared/ui';
import { DealSheetFrame } from '../../../components/DealSheetFrame';
import { DEAL_FIX_CHIPS, DEAL_PUBLISH_LIMITS } from '../../../constants/dealPublish';
import type { DealFixFormValues } from '../../../schemas/dealPublishSchema';
import type { DealFixCount } from '../../../utils/dealPublish';

const TRY = moderateScale(8);

export interface PublicationFixSheetProps {
  visible: boolean;
  onClose: () => void;
  fixes: DealFixCount;
  control: Control<DealFixFormValues>;
  onChip: (text: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}

const FixChip = memo<{ labelKey: ParseKeys; on: boolean; onPick: (text: string) => void }>(
  ({ labelKey, on, onPick }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const label = t(labelKey);
    const styles = useStyles(
      ({ radii, spacing }): Record<'chip', ViewStyle> => ({
        chip: {
          minHeight: sizes.button.sm + spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: radii.sm,
          justifyContent: 'center',
          backgroundColor: on ? colors.interactive.soft : colors.surface.elevated,
        },
      }),
      [colors.interactive.soft, colors.surface.elevated, on, sizes.button.sm],
    );
    const pick = useCallback(() => onPick(label), [label, onPick]);
    return (
      <Pressable
        style={styles.chip}
        onPress={pick}
        scaleOnPress
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        accessibilityLabel={label}
      >
        <Text variant="bodySmall" color={on ? colors.interactive.text : colors.text.primary}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

/** The chips light up while their words are in the note. */
const FixChips = memo<{ control: Control<DealFixFormValues>; onPick: (text: string) => void }>(({ control, onPick }) => {
  const { t } = useTranslation();
  const note = useWatch({ control, name: 'note' });
  return (
    <Box row wrap gap="sm">
      {DEAL_FIX_CHIPS.map(key => (
        <FixChip key={key} labelKey={key} on={note.includes(t(key))} onPick={onPick} />
      ))}
    </Box>
  );
});

/**
 * Asking for a fix: which try this is (two bars, the one being used lit amber), quick reasons that
 * write the note for you, and the note itself (required, editable, sent to the creator).
 */
const PublicationFixSheetComponent: React.FC<PublicationFixSheetProps> = ({
  visible,
  onClose,
  fixes,
  control,
  onChip,
  submitting,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii }): Record<'try' | 'used' | 'open', ViewStyle> => ({
      try: { flex: 1, height: TRY, borderRadius: radii.full },
      used: { backgroundColor: colors.status.warning.main },
      open: { backgroundColor: colors.surface.elevated },
    }),
    [colors.status.warning.main, colors.surface.elevated],
  );
  const next = fixes.used + 1;
  const last = fixes.remaining <= 1;

  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.publish.fix.title')}
      body={t('marketplace.deals.publish.fix.body')}
      footer={
        <CustomButton
          title={t('marketplace.deals.publish.fix.send')}
          size="lg"
          fullWidth
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <Box gap="sm">
        <Box row gap="xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: fixes.allowed }, (_, index) => (
            <Box key={`try-${index}`} style={[styles.try, index < next ? styles.used : styles.open]} />
          ))}
        </Box>
        <Text variant="caption" color={last ? colors.status.warning.text : colors.text.tertiary}>
          {last
            ? t('marketplace.deals.publish.fix.last')
            : t('marketplace.deals.publish.fix.tries', { n: next, allowed: fixes.allowed })}
        </Text>
      </Box>
      <FixChips control={control} onPick={onChip} />
      <Controller
        control={control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.publish.fix.label')}
            placeholder={t('marketplace.deals.publish.fix.placeholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            showCount
            maxLength={DEAL_PUBLISH_LIMITS.fixNote}
            error={fieldState.error?.message}
          />
        )}
      />
    </DealSheetFrame>
  );
};

export const PublicationFixSheet = memo(PublicationFixSheetComponent);
