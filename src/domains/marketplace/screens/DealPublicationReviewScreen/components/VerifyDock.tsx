import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RotateCcw, WalletCards } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';

export interface VerifyDockProps {
  itemTitle: string;
  /** The deal's escrow, when confirming this post completes the deal and releases it. */
  release: Money | null;
  /** Fix requests left; `0` hides the button (a dispute is the way then, P8). */
  fixesLeft: number;
  verifying: boolean;
  onVerify: () => Promise<boolean>;
  onFix: () => void;
}

/**
 * The check's decision bar: on the last deliverable a mint line says confirming completes the deal
 * and releases the escrow; then press-and-hold to confirm the post, with «ask for a link fix» (and
 * how many are left) under it.
 */
const VerifyDockComponent: React.FC<VerifyDockProps> = ({ itemTitle, release, fixesLeft, verifying, onVerify, onFix }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'release' | 'releaseText' | 'fix', ViewStyle> => ({
      release: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.money.soft,
      },
      releaseText: { flex: 1 },
      fix: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: sizes.button.md,
      },
    }),
    [colors.money.soft, sizes.button.md],
  );

  const fixLabel = t('marketplace.deals.publish.brand.dock.fix');
  const fixLeft = t('marketplace.deals.publish.brand.dock.fixLeft', { count: formatNumber(fixesLeft) });

  return (
    <Box px="xl" pt="md" pb="sm" gap="sm">
      {release ? (
        <Box style={styles.release} accessible accessibilityRole="text">
          <WalletCards size={sizes.icon.sm} color={colors.money.main} />
          <Text variant="caption" color={colors.text.primary} style={styles.releaseText}>
            {t('marketplace.deals.publish.brand.release')}
          </Text>
          <MoneyText value={release} size="md" tone="money" />
        </Box>
      ) : null}
      <DealHoldToSign
        label={
          release ? t('marketplace.deals.publish.brand.dock.complete') : t('marketplace.deals.publish.brand.dock.verify')
        }
        caption={t('marketplace.deals.publish.brand.dock.caption')}
        hint={t('marketplace.deals.publish.brand.dock.hint')}
        accessibilityLabel={t('marketplace.deals.publish.brand.dock.a11y', { item: itemTitle })}
        accessibilityHint={t('marketplace.deals.publish.brand.dock.hint')}
        onComplete={onVerify}
        sending={verifying}
        sendingLabel={t('marketplace.deals.publish.brand.dock.verifying')}
      />
      {fixesLeft > 0 ? (
        <Pressable
          style={styles.fix}
          onPress={onFix}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={`${fixLabel} ${fixLeft}`}
        >
          <RotateCcw size={sizes.icon.xs} color={colors.text.primary} />
          <Text variant="buttonSmall" color={colors.text.primary}>
            {fixLabel}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {fixLeft}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const VerifyDock = memo(VerifyDockComponent);
