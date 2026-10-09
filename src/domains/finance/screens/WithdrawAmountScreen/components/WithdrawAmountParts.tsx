import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  Countdown,
  CustomButton,
  Divider,
  KeyValueRow,
  MoneyText,
  Notice,
  Pressable,
  Skeleton,
  Text,
} from '@/shared/ui';
import type { PayoutMethodView } from '../../../utils/payoutMethodView';
import type { WithdrawAmountScreenModel } from '../hooks/useWithdrawAmountScreen';

const DIMMED = 0.5;
const SKELETON_CARD_HEIGHT = moderateScale(76);
const SKELETON_AMOUNT_HEIGHT = moderateScale(96);
const SKELETON_QUOTE_HEIGHT = moderateScale(148);

type QuoteView = NonNullable<WithdrawAmountScreenModel['quoteView']>;

/** "To · Sham Cash · Primary · •••• 3456" with a teal Change link. */
export const DestinationCard = memo<{
  view: PayoutMethodView;
  onChange: () => void;
}>(({ view, onChange }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = view.icon;
  const meta = view.isDefault
    ? view.meta
      ? `${t('finance.withdraw.amount.primary')} · ${view.meta}`
      : t('finance.withdraw.amount.primary')
    : view.meta;
  return (
    <Card px="lg" py="md">
      <Box row align="center" gap="md">
        <Box
          width={sizes.iconButton.md}
          height={sizes.iconButton.md}
          borderRadius="md"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.tertiary}>
            {t('finance.withdraw.amount.to')}
          </Text>
          <Text variant="bodyMedium" numberOfLines={1}>
            {view.title}
          </Text>
          {meta ? (
            <Text
              variant="caption"
              color={colors.text.secondary}
              numberOfLines={1}
            >
              {meta}
            </Text>
          ) : null}
        </Box>
        <Pressable
          onPress={onChange}
          minHeight={sizes.button.sm}
          justify="center"
          px="xs"
          accessibilityRole="button"
          accessibilityLabel={t('finance.withdraw.amount.changeA11y')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('finance.withdraw.amount.change')}
          </Text>
        </Pressable>
      </Box>
    </Card>
  );
});

/** No method yet: the one way forward is adding one (it comes back here, picked). */
export const AddMethodCard = memo<{ onAdd: () => void; error?: string }>(
  ({ onAdd, error }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    return (
      <Card px="lg" py="lg">
        <Box gap="md">
          <Box row align="center" gap="md">
            <Box
              width={sizes.iconButton.md}
              height={sizes.iconButton.md}
              borderRadius="md"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              <Landmark size={sizes.icon.sm} color={colors.interactive.main} />
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium">
                {t('finance.withdraw.amount.noMethodTitle')}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {t('finance.withdraw.amount.noMethodBody')}
              </Text>
            </Box>
          </Box>
          <CustomButton
            title={t('finance.withdraw.amount.addMethod')}
            variant="secondary"
            size="md"
            onPress={onAdd}
          />
          {error ? (
            <Text variant="caption" color={colors.status.danger.text}>
              {error}
            </Text>
          ) : null}
        </Box>
      </Card>
    );
  },
);

/** Blocked by the server: every reason, then when the next withdrawal opens. */
export const BlockedNotice = memo<{
  reasons: readonly string[];
  nextAllowedMs: number | null;
}>(({ reasons, nextAllowedMs }) => {
  const { t } = useTranslation();
  return (
    <Box gap="sm">
      <Notice
        tone="warning"
        title={t('finance.withdraw.amount.blockedTitle')}
        message={
          reasons.length > 0
            ? reasons.map(reason => `• ${reason}`).join('\n')
            : t('finance.withdraw.amount.blockedFallback')
        }
      />
      {nextAllowedMs !== null ? (
        <Box row>
          <Countdown
            endsAt={nextAllowedMs}
            label={t('finance.withdraw.amount.nextAllowed')}
          />
        </Box>
      ) : null}
    </Box>
  );
});

/** Live quote: taken → fee → net (mint) → pounds received (estimate) + rate caption. */
export const QuoteCard = memo<{ quote: QuoteView; dimmed: boolean }>(
  ({ quote, dimmed }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    return (
      <Box
        gap="sm"
        opacity={dimmed ? DIMMED : 1}
        accessibilityState={{ busy: dimmed }}
      >
        <Card px="lg" py="sm">
          <Box py="xs">
            <KeyValueRow
              label={t('finance.withdraw.amount.quote.gross')}
              value={quote.gross}
            />
          </Box>
          {quote.fee ? (
            <>
              <Divider />
              <Box py="xs">
                <KeyValueRow label={quote.feeLabel} value={quote.fee} />
              </Box>
            </>
          ) : null}
          <Divider />
          <Box py="xs">
            <KeyValueRow
              label={t('finance.withdraw.amount.quote.net')}
              emphasis="strong"
              value={<MoneyText value={quote.net} size="title" tone="money" />}
            />
          </Box>
          {quote.payout ? (
            <>
              <Divider />
              <Box py="xs">
                <KeyValueRow
                  label={t('finance.withdraw.amount.quote.payout')}
                  value={
                    <MoneyText value={quote.payout} tone="money" estimate />
                  }
                />
              </Box>
            </>
          ) : null}
        </Card>
        {quote.rateCaption ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {quote.rateCaption}
          </Text>
        ) : null}
      </Box>
    );
  },
);

export const AmountSkeleton = memo(() => (
  <Box
    gap="2xl"
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
  >
    <Skeleton width="100%" height={SKELETON_CARD_HEIGHT} borderRadius="lg" />
    <Skeleton width="100%" height={SKELETON_AMOUNT_HEIGHT} borderRadius="md" />
    <Skeleton width="100%" height={SKELETON_QUOTE_HEIGHT} borderRadius="lg" />
  </Box>
));
