import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftRight,
  ArrowUpLeft,
  ArrowUpRight,
  ListChecks,
  Lock,
  Package,
  Timer,
  type LucideIcon,
} from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Avatar, Box, MoneyText, Pressable, Text } from '@/shared/ui';
import type { DealRetentionTerm, DealShippingMode } from '../../../types/deal';
import type { DealQuoteLine } from '../../../types/dealOffer';
import { monogramOf } from '../../../utils/creatorText';
import { formatDuration, quotePaceHours } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';

const FACE = moderateScale(44);
const SWAP = moderateScale(32);

const RETENTION_LABEL = {
  '24h': 'marketplace.offer.retention.24h',
  '30d': 'marketplace.offer.retention.30d',
  '90d': 'marketplace.offer.retention.90d',
  '180d': 'marketplace.offer.retention.180d',
  permanent: 'marketplace.offer.retention.permanent',
} as const satisfies Record<DealRetentionTerm, string>;

const SHIPPING_LABEL = {
  none: 'marketplace.offer.review.noShipping',
  gift: 'marketplace.offer.shipping.giftTitle',
  returnable: 'marketplace.offer.shipping.returnableTitle',
} as const satisfies Record<DealShippingMode, string>;

interface PartyProps {
  name: string;
  role: string;
  avatarUrl: string | null;
  handle: string | null;
}

/** One side of the deal: face, name, and the role (or the creator's handle, read left to right). */
const Party = memo<PartyProps>(({ name, role, avatarUrl, handle }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'face', ViewStyle> => ({
      face: {
        width: FACE,
        height: FACE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: colors.brand.soft,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
      },
    }),
    [colors.border.default, colors.brand.soft],
  );
  return (
    <Box flex={1} row align="center" gap="sm">
      <Box style={styles.face}>
        {avatarUrl ? (
          <Avatar uri={avatarUrl} size={FACE} />
        ) : (
          <Text variant="label" color={colors.brand.text}>
            {monogramOf(name)}
          </Text>
        )}
      </Box>
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
          {name}
        </Text>
        <Text
          variant="caption"
          color={colors.text.tertiary}
          numberOfLines={1}
          writingDirection={handle ? 'ltr' : undefined}
        >
          {handle ?? role}
        </Text>
      </Box>
    </Box>
  );
});

const DealLine = memo<{ line: DealQuoteLine }>(({ line }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const terms = [
    ...line.addons.map(addon => t('marketplace.offer.review.addon', { label: addon.label })),
    line.retention ? t(RETENTION_LABEL[line.retention]) : null,
    t('marketplace.offer.units.revisions', { count: line.revisions }),
  ].filter((part): part is string => part !== null);
  return (
    <Box row align="flex-start" justify="space-between" gap="md">
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {t('marketplace.offer.review.lineTitle', { count: line.quantity, title: line.title })}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {terms.join(' · ')}
        </Text>
      </Box>
      <MoneyText value={line.total} size="md" />
    </Box>
  );
});

interface SpecProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const Spec = memo<SpecProps>(({ icon: Icon, label, value }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'tile', ViewStyle> => ({
      tile: {
        flex: 1,
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.surface.elevated,
      },
    }),
    [colors.surface.elevated],
  );
  return (
    <Box style={styles.tile}>
      <Icon size={sizes.icon.xs} color={colors.interactive.main} />
      <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
        {label}
      </Text>
      <Text variant="label" color={colors.text.primary} numberOfLines={2}>
        {value}
      </Text>
    </Box>
  );
});

/**
 * The deal as a signed business document: both parties, what is bought at what price, the three
 * terms that matter, where the money waits, and the full contract one tap away. Amounts are the quote's.
 */
const ExecutiveDealCardComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { quote, creator, creatorName, brandName, brandAvatar, offer, attachments, openContract } = useOfferBuilder();
  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'card' | 'rule' | 'swap' | 'escrow' | 'contract', ViewStyle> => ({
      card: {
        padding: spacing.lg,
        gap: spacing.lg,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.default,
        ...shadows.card,
      },
      rule: { height: borderWidths.hairline, backgroundColor: colors.border.default },
      swap: {
        width: SWAP,
        height: SWAP,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.elevated,
      },
      escrow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.money.soft,
      },
      contract: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: sizes.button.md,
      },
    }),
    [colors.border.default, colors.money.soft, colors.surface.elevated, colors.surface.main, sizes.button.md],
  );
  if (!quote) return null;

  const briefCount = offer.brief.talkingPoints.length + offer.brief.donts.length;
  const brief = [
    briefCount > 0 ? t('marketplace.offer.units.briefItems', { count: briefCount }) : null,
    attachments.count > 0 ? t('marketplace.offer.units.attachments', { count: attachments.count }) : null,
  ].filter((part): part is string => part !== null);
  const terms = quote.contractTerms?.items.length ?? 0;
  const contractLabel =
    terms > 0
      ? t('marketplace.offer.review.contractCount', { terms: t('marketplace.offer.units.briefItems', { count: terms }) })
      : t('marketplace.offer.review.contract');
  const Outward = isRTL ? ArrowUpLeft : ArrowUpRight;

  return (
    <Box style={styles.card}>
      <Box row align="center" gap="sm">
        <Party name={brandName} role={t('marketplace.offer.review.brand')} avatarUrl={brandAvatar} handle={null} />
        <Box style={styles.swap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ArrowLeftRight size={sizes.icon.xs} color={colors.text.tertiary} />
        </Box>
        <Party
          name={creatorName}
          role={t('marketplace.offer.review.creator')}
          avatarUrl={creator?.avatarUrl ?? null}
          handle={creator?.handle ?? null}
        />
      </Box>
      <Box style={styles.rule} />
      <Box gap="md">
        <Text variant="overline" color={colors.text.tertiary}>
          {t('marketplace.offer.review.deliverables')}
        </Text>
        {quote.lines.map(line => (
          <DealLine key={line.rateCardId} line={line} />
        ))}
      </Box>
      <Box style={styles.rule} />
      <Box row align="center" justify="space-between" gap="md">
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t('marketplace.offer.review.total')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.offer.review.totalNote')}
          </Text>
        </Box>
        <MoneyText value={quote.total} size="lg" />
      </Box>
      <Box row gap="sm">
        <Spec icon={Timer} label={t('marketplace.offer.review.duration')} value={formatDuration(t, quotePaceHours(quote))} />
        <Spec icon={Package} label={t('marketplace.offer.review.product')} value={t(SHIPPING_LABEL[offer.shippingMode])} />
        <Spec
          icon={ListChecks}
          label={t('marketplace.offer.review.brief')}
          value={brief.length > 0 ? brief.join(' · ') : t('marketplace.offer.review.empty')}
        />
      </Box>
      <Box style={styles.escrow}>
        <Lock size={sizes.icon.xs} color={colors.money.text} />
        <Box flex={1}>
          <Text variant="caption" color={colors.money.text}>
            {t('marketplace.offer.review.escrowNote')}
          </Text>
        </Box>
      </Box>
      <Pressable style={styles.contract} onPress={openContract} accessibilityRole="button" accessibilityLabel={contractLabel}>
        <Text variant="label" color={colors.interactive.main}>
          {contractLabel}
        </Text>
        <Outward size={sizes.icon.xs} color={colors.interactive.main} />
      </Pressable>
    </Box>
  );
};

export const ExecutiveDealCard = memo(ExecutiveDealCardComponent);
