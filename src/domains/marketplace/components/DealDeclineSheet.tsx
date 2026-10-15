import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Check, Info } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Pressable, Text } from '@/shared/ui';
import { DEAL_DECLINE_REASON_DEF } from '../constants/dealRespond';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealDeclineFormValues } from '../schemas/dealRespondSchema';
import { DEAL_DECLINE_REASON, type DealDeclineReason } from '../types';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealDeclineSheetProps {
  visible: boolean;
  onClose: () => void;
  brandName: string;
  control: Control<DealDeclineFormValues>;
  onSubmit: () => void;
  submitting: boolean;
}

interface ReasonTileProps {
  reason: DealDeclineReason;
  selected: boolean;
  onPick: (reason: DealDeclineReason) => void;
}

const ReasonTile = memo<ReasonTileProps>(({ reason, selected, onPick }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const def = DEAL_DECLINE_REASON_DEF[reason];
  const Icon = def.icon;
  const styles = useStyles(
    ({
      radii,
      spacing,
      borderWidths,
    }): Record<'tile' | 'icon' | 'check', ViewStyle> => ({
      tile: {
        flexBasis: '47%',
        flexGrow: 1,
        minHeight: sizes.thumbnail.md,
        padding: spacing.md,
        gap: spacing.sm,
        justifyContent: 'space-between',
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        borderColor: selected ? colors.interactive.main : colors.border.default,
        backgroundColor: selected
          ? colors.interactive.soft
          : colors.surface.main,
      },
      icon: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected
          ? colors.interactive.main
          : colors.surface.elevated,
      },
      check: {
        position: 'absolute',
        top: spacing.md,
        end: spacing.md,
        width: sizes.icon.md,
        height: sizes.icon.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.main,
      },
    }),
    [
      colors.border.default,
      colors.interactive.main,
      colors.interactive.soft,
      colors.surface.elevated,
      colors.surface.main,
      selected,
      sizes,
    ],
  );
  const onPress = useCallback(() => onPick(reason), [onPick, reason]);
  return (
    <Pressable
      style={styles.tile}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(def.label)}
    >
      <Box style={styles.icon}>
        <Icon
          size={sizes.icon.sm}
          color={selected ? colors.text.onAccent : colors.icon.secondary}
        />
      </Box>
      <Text variant="buttonSmall" color={colors.text.primary}>
        {t(def.label)}
      </Text>
      {selected ? (
        <Box style={styles.check}>
          <Check size={sizes.icon.xs} color={colors.text.onAccent} />
        </Box>
      ) : null}
    </Pressable>
  );
});

/** The note field only exists for «other»; it watches the reason so the tiles don't re-render on typing. */
const OtherNote = memo<{ control: Control<DealDeclineFormValues> }>(
  ({ control }) => {
    const { t } = useTranslation();
    const reason = useWatch({ control, name: 'reason' });
    if (reason !== 'other') return null;
    return (
      <Controller
        control={control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.respond.decline.noteLabel')}
            placeholder={t('marketplace.deals.respond.decline.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RESPOND_LIMITS.maxNoteLength}
            error={fieldState.error?.message}
            autoFocus
          />
        )}
      />
    );
  },
);

/**
 * Turning an offer down: four reason tiles (a tap picks one), «other» asks a few words; sent
 * as is, no second confirm. Declining before accepting records no strike.
 */
const DealDeclineSheetComponent: React.FC<DealDeclineSheetProps> = ({
  visible,
  onClose,
  brandName,
  control,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.respond.decline.title')}
      body={t('marketplace.deals.respond.decline.body', { name: brandName })}
      footer={
        <CustomButton
          title={t('marketplace.deals.respond.decline.submit')}
          variant="danger"
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
          <Box gap="xs" accessibilityRole="radiogroup">
            <Box row wrap gap="sm">
              {DEAL_DECLINE_REASON.map(reason => (
                <ReasonTile
                  key={reason}
                  reason={reason}
                  selected={value === reason}
                  onPick={onChange}
                />
              ))}
            </Box>
            {fieldState.error?.message ? (
              <Text variant="caption" color={colors.status.danger.text}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </Box>
        )}
      />
      <OtherNote control={control} />
      <Box
        row
        gap="sm"
        align="center"
        p="md"
        bg={colors.surface.main}
        borderRadius="md"
      >
        <Info size={sizes.icon.sm} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.respond.decline.noStrike')}
          </Text>
        </Box>
      </Box>
    </DealSheetFrame>
  );
};

export const DealDeclineSheet = memo(DealDeclineSheetComponent);
