import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleQuestionMark, LogOut } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Notice, Pressable, Text } from '@/shared/ui';
import type { DealCancelModel } from '../hooks/useDealCancel';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { DealReasonFields } from './DealReasonFields';
import { DealSheetFrame } from './DealSheetFrame';

/** Enough pips to read as a tally; the count in the sentence is the exact figure. */
const MAX_PIPS = 6;

export interface DealWithdrawSheetProps {
  cancel: DealCancelModel;
  deal: Deal;
}

/**
 * The creator walking away from a running deal (M8). It says plainly what it costs: a strike, with
 * the active count and how long a new one lasts, and a way to read what strikes are. When the free
 * shipping cancel is open the sheet sends the creator there instead, with no strike. Hold to confirm.
 */
const DealWithdrawSheetComponent: React.FC<DealWithdrawSheetProps> = ({ cancel, deal }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'pip' | 'pipNew', ViewStyle> => {
      const pip: ViewStyle = {
        width: sizes.icon.md,
        height: sizes.icon.md,
        borderRadius: radii.full,
        backgroundColor: colors.status.warning.main,
      };
      return {
        pip,
        pipNew: {
          ...pip,
          backgroundColor: colors.status.danger.soft,
          borderWidth: borderWidths.md,
          borderStyle: 'dashed',
          borderColor: colors.status.danger.main,
        },
      };
    },
    [
      colors.status.danger.main,
      colors.status.danger.soft,
      colors.status.warning.main,
      sizes.icon.md,
    ],
  );
  const name = deal.brand.name ?? '';
  const { strikes, strike, freeCancel } = cancel;
  const active = strikes?.activeCount ?? null;
  const days = strikes?.windowDays ?? null;

  const strikeBody =
    active === null || days === null
      ? t('marketplace.deals.changes.withdraw.strikeBodyPlain')
      : active === 0
        ? t('marketplace.deals.changes.withdraw.strikeBodyClean', { days })
        : t('marketplace.deals.changes.withdraw.strikeBody', { count: active, days });

  const footer = freeCancel ? (
    <CustomButton
      title={t('marketplace.deals.changes.withdraw.freeAction')}
      size="lg"
      fullWidth
      onPress={cancel.goFreeCancel}
    />
  ) : (
    <DealHoldToSign
      label={t('marketplace.deals.changes.withdraw.hold')}
      caption={t('marketplace.deals.changes.withdraw.holdCaption', { name })}
      hint={t('marketplace.deals.respond.hold.hint')}
      accessibilityLabel={t('marketplace.deals.changes.withdraw.title')}
      accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
      tone="danger"
      icon={LogOut}
      onComplete={cancel.onConfirm}
    />
  );

  return (
    <DealSheetFrame
      visible={cancel.visible}
      onClose={cancel.close}
      onDismissed={cancel.onDismissed}
      title={t('marketplace.deals.changes.withdraw.title')}
      body={t('marketplace.deals.changes.withdraw.body', { name })}
      footer={footer}
    >
      {freeCancel ? (
        <Notice
          tone="success"
          title={t('marketplace.deals.changes.withdraw.freeTitle')}
          message={t('marketplace.deals.changes.withdraw.freeBody')}
        />
      ) : (
        <>
          {strike ? (
            <Box p="lg" gap="md" bg={colors.surface.main} borderRadius="xl" shadow="card">
              <Box row gap="xs" align="center" accessible={false}>
                {Array.from({ length: Math.min(active ?? 0, MAX_PIPS) }, (_, index) => (
                  <Box key={index} style={styles.pip} />
                ))}
                <Box style={styles.pipNew} />
              </Box>
              <Box gap="xs">
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {t('marketplace.deals.changes.withdraw.strikeTitle')}
                </Text>
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {strikeBody}
                </Text>
              </Box>
              <Pressable
                onPress={cancel.openStrikes}
                accessibilityRole="link"
                accessibilityLabel={t('marketplace.deals.changes.withdraw.strikesLink')}
              >
                <Box row gap="xs" align="center">
                  <CircleQuestionMark size={sizes.icon.sm} color={colors.interactive.main} />
                  <Text variant="buttonSmall" color={colors.interactive.main}>
                    {t('marketplace.deals.changes.withdraw.strikesLink')}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          ) : (
            <Notice message={t('marketplace.deals.changes.withdraw.noStrike')} />
          )}
          <DealReasonFields control={cancel.control} reasons={cancel.reasons} defs={cancel.reasonDefs} />
        </>
      )}
    </DealSheetFrame>
  );
};

export const DealWithdrawSheet = memo(DealWithdrawSheetComponent);
