import React, { memo, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomInput, Text, SheetFrame } from '@/shared/ui';
import {
  DEAL_EXTENSION_ANSWER_HOURS,
  DEAL_MAX_EXTENSION_DAYS,
  DEAL_RESPOND_LIMITS,
} from '../constants/dealOffer';
import type { DealExtensionFormValues } from '../schemas/dealRespondSchema';
import type { DealExtensionRange } from '../utils/dealRespond';
import { formatDays, formatDuration } from '../utils/offerDuration';
import { DealDayRuler } from './DealDayRuler';
import { DealHoldToSign } from './DealHoldToSign';

export interface DealExtensionSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Fires once gone: the address sheet opens next after a refused address. */
  onDismissed?: () => void;
  brandName: string;
  range: DealExtensionRange;
  control: Control<DealExtensionFormValues>;
  onSign: () => Promise<boolean>;
  /** Under the reason (the delivery address line with a product). */
  children?: ReactNode;
}

/** The picked total, big, with how many days it adds. Watches `days` alone. */
const DaysFigure = memo<{
  control: Control<DealExtensionFormValues>;
  current: number;
}>(({ control, current }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const days = useWatch({ control, name: 'days' });
  const styles = useStyles(
    ({ radii, spacing }): Record<'added', ViewStyle> => ({
      added: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.soft,
        marginBottom: spacing.sm,
      },
    }),
    [colors.interactive.soft],
  );
  return (
    <Box align="center" gap="xs" accessible accessibilityLiveRegion="polite">
      <Box row align="flex-end" justify="center" gap="sm">
        <Text variant="amountDisplay" color={colors.text.primary}>
          {formatNumber(days)}
        </Text>
        <Box pb="sm">
          <Text variant="title" color={colors.text.secondary}>
            {t('marketplace.deals.respond.extension.dayWord', { count: days })}
          </Text>
        </Box>
        <Box style={styles.added}>
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.deals.respond.extension.added', {
              count: days - current,
            })}
          </Text>
        </Box>
      </Box>
      <Text variant="bodySmall" color={colors.text.tertiary}>
        {t('marketplace.deals.respond.extension.was', {
          duration: formatDays(t, current),
        })}
      </Text>
    </Box>
  );
});

/**
 * Asking for more time, once: scrub the ruler to the new total (today + 1 … + 14), say why, and
 * hold to sign. Asking signs the contract and the time addendum; the brand then has 48 hours.
 */
const DealExtensionSheetComponent: React.FC<DealExtensionSheetProps> = ({
  visible,
  onClose,
  onDismissed,
  brandName,
  range,
  control,
  onSign,
  children,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <SheetFrame
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      title={t('marketplace.deals.respond.extension.title')}
      body={t('marketplace.deals.respond.extension.body', {
        days: formatDays(t, DEAL_MAX_EXTENSION_DAYS),
      })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.respond.extension.hold')}
          caption={t('marketplace.deals.respond.extension.holdCaption')}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.respond.extension.hold')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          onComplete={onSign}
        />
      }
    >
      <DaysFigure control={control} current={range.current} />
      <Controller
        control={control}
        name="days"
        render={({ field: { value, onChange } }) => (
          <DealDayRuler
            current={range.current}
            max={range.max}
            value={value}
            onChange={onChange}
            accessibilityLabel={t(
              'marketplace.deals.respond.extension.rulerA11y',
            )}
            accessibilityValue={formatDays(t, value)}
          />
        )}
      />
      <Controller
        control={control}
        name="reason"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.respond.extension.reasonLabel')}
            placeholder={t(
              'marketplace.deals.respond.extension.reasonPlaceholder',
            )}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RESPOND_LIMITS.maxNoteLength}
            error={fieldState.error?.message}
          />
        )}
      />
      <Box row gap="sm" p="md" bg={colors.status.info.soft} borderRadius="md">
        <Info size={sizes.icon.sm} color={colors.status.info.main} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.primary}>
            {t('marketplace.deals.respond.extension.note', {
              name: brandName,
              duration: formatDuration(t, DEAL_EXTENSION_ANSWER_HOURS),
            })}
          </Text>
        </Box>
      </Box>
      {children}
    </SheetFrame>
  );
};

export const DealExtensionSheet = memo(DealExtensionSheetComponent);
