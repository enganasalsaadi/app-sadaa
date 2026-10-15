import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, Skeleton, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import { DealSheetFrame } from '../../../components/DealSheetFrame';
import type { ExtraQuote } from '../hooks/useDealDraftReviewScreen';

const ROUND_BADGE = moderateScale(52);
const SKELETON_H = moderateScale(120);

export interface ReviewExtraSheetProps {
  visible: boolean;
  onClose: () => void;
  creatorName: string;
  itemTitle: string;
  extra: ExtraQuote;
  canTopUp: boolean;
  onTopUp: () => void;
  sending: boolean;
  onRequest: () => Promise<boolean>;
}

/**
 * Out of revision rounds (`deal_revisions_exhausted`): one more round at the creator's fixed price,
 * quoted by the server (price, rounds before → after, wallet shortfall). Press and hold signs the
 * request; nothing is charged until the creator accepts. Short wallet → top up the exact amount.
 */
const ReviewExtraSheetComponent: React.FC<ReviewExtraSheetProps> = ({
  visible,
  onClose,
  creatorName,
  itemTitle,
  extra,
  canTopUp,
  onTopUp,
  sending,
  onRequest,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card' | 'badge' | 'short', ViewStyle> => ({
      card: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      badge: {
        width: ROUND_BADGE,
        height: ROUND_BADGE,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      short: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.status.warning.soft,
      },
    }),
    [colors],
  );
  const ready = extra.state === 'ready' ? extra.quote : null;
  const shortfall = ready && !ready.wallet.isSufficient ? ready.wallet.shortfall : null;

  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.drafts.review.extra.title')}
      body={t('marketplace.deals.drafts.review.extra.body', { name: creatorName })}
      footer={
        ready ? (
          <DealHoldToSign
            label={t('marketplace.deals.drafts.review.extra.hold')}
            caption={t('marketplace.deals.drafts.review.extra.holdCaption')}
            hint={t('marketplace.deals.drafts.review.extra.holdHint')}
            accessibilityLabel={t('marketplace.deals.drafts.review.extra.holdA11y')}
            accessibilityHint={t('marketplace.deals.drafts.review.extra.holdHint')}
            onComplete={onRequest}
            sending={sending}
            sendingLabel={t('marketplace.deals.drafts.review.extra.sending')}
          />
        ) : (
          <CustomButton
            title={t('marketplace.deals.drafts.review.extra.back')}
            variant="secondary"
            size="lg"
            fullWidth
            onPress={onClose}
          />
        )
      }
    >
      {extra.state === 'loading' ? <Skeleton width="100%" height={SKELETON_H} borderRadius="lg" /> : null}
      {extra.state === 'unavailable' ? (
        <Text variant="body" color={colors.text.secondary}>
          {extra.message ?? t('marketplace.deals.drafts.review.extra.unavailable', { name: creatorName })}
        </Text>
      ) : null}
      {ready ? (
        <Box style={styles.card}>
          <Box row align="center" gap="md">
            <Box style={styles.badge}>
              <Text variant="h3" color={colors.interactive.text}>
                {t('marketplace.deals.drafts.review.extra.plusOne')}
              </Text>
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t('marketplace.deals.drafts.review.extra.card')}
              </Text>
              <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                {t('marketplace.deals.drafts.review.extra.on', { item: ready.title ?? itemTitle })}
              </Text>
              {ready.revisions ? (
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.deals.drafts.review.extra.rounds', ready.revisions)}
                </Text>
              ) : null}
            </Box>
            <MoneyText value={ready.amount} size="title" />
          </Box>
        </Box>
      ) : null}
      {shortfall ? (
        <Box gap="sm">
          <Box style={styles.short}>
            <Wallet size={sizes.icon.sm} color={colors.status.warning.main} />
            <Text variant="bodySmall" color={colors.status.warning.text}>
              {t('marketplace.deals.drafts.review.extra.short', { amount: formatMoney(shortfall, i18n.language) })}
            </Text>
          </Box>
          {canTopUp ? (
            <CustomButton
              title={t('marketplace.deals.drafts.review.extra.topUp', { amount: formatMoney(shortfall, i18n.language) })}
              variant="secondary"
              size="md"
              fullWidth
              onPress={onTopUp}
            />
          ) : null}
        </Box>
      ) : null}
    </DealSheetFrame>
  );
};

export const ReviewExtraSheet = memo(ReviewExtraSheetComponent);
