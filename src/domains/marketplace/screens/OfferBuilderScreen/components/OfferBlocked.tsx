import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ban, BookmarkPlus, FileStack, FileWarning, ShieldCheck, Ticket, type LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import type { DealBlocker, DealBlockerCode } from '../../../types/dealOffer';
import { useOfferBuilder } from '../OfferBuilderContext';

const DISC = moderateScale(96);
const HALO = moderateScale(28);

interface BlockerLook {
  icon: LucideIcon;
  title: string;
  body: string | null;
  cta: string;
  meter: 'openOffers' | 'drafts' | null;
}

/** Copy, icon and usage meter per blocker; the generic one shows the server's own text. */
const useBlockerLook = (blocker: DealBlocker, creatorName: string, isShortlisted: boolean): BlockerLook => {
  const { t } = useTranslation();
  const code: DealBlockerCode | null = blocker.code;
  switch (code) {
    case 'kyc_required':
      return {
        icon: ShieldCheck,
        title: t('marketplace.offer.blocked.kyc.title'),
        body: t('marketplace.offer.blocked.kyc.body'),
        cta: t('marketplace.offer.blocked.kyc.cta'),
        meter: null,
      };
    case 'deal_creator_unavailable':
      return {
        icon: BookmarkPlus,
        title: t('marketplace.offer.blocked.unavailable.title', { name: creatorName }),
        body: t('marketplace.offer.blocked.unavailable.body'),
        cta: isShortlisted
          ? t('marketplace.offer.blocked.unavailable.ctaSaved')
          : t('marketplace.offer.blocked.unavailable.cta'),
        meter: null,
      };
    case 'deal_offer_exists':
      return {
        icon: Ticket,
        title: t('marketplace.offer.blocked.exists.title', { name: creatorName }),
        body: t('marketplace.offer.blocked.exists.body'),
        cta: t('marketplace.offer.blocked.exists.cta'),
        meter: null,
      };
    case 'deal_offer_limit':
      return {
        icon: FileWarning,
        title: t('marketplace.offer.blocked.offerLimit.title'),
        body: t('marketplace.offer.blocked.offerLimit.body'),
        cta: t('marketplace.offer.blocked.offerLimit.cta'),
        meter: 'openOffers',
      };
    case 'deal_draft_limit':
      return {
        icon: FileStack,
        title: t('marketplace.offer.blocked.draftLimit.title'),
        body: t('marketplace.offer.blocked.draftLimit.body'),
        cta: t('marketplace.offer.blocked.draftLimit.cta'),
        meter: 'drafts',
      };
    case null:
      return {
        icon: Ban,
        title: t('marketplace.offer.blocked.generic.title'),
        body: blocker.label,
        cta: t('marketplace.offer.blocked.back'),
        meter: null,
      };
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
};

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
}

/** «Open offers 5/5»: one segment per slot, all lit at the limit. */
const UsageMeter = memo<UsageMeterProps>(({ label, used, limit }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'segment', ViewStyle> => ({
      segment: { flex: 1, height: spacing.sm, borderRadius: radii.full },
    }),
    [],
  );
  const slots = Math.max(1, Math.min(limit, 20));
  return (
    <Box width="100%" gap="sm" p="lg" borderRadius="xl" bg={colors.surface.main} shadow="card">
      <Box row justify="space-between">
        <Text variant="label" color={colors.text.secondary}>
          {label}
        </Text>
        <Text variant="label" color={colors.status.warning.text} writingDirection="ltr">
          {`${formatNumber(used)}/${formatNumber(limit)}`}
        </Text>
      </Box>
      <Box row gap="xs">
        {Array.from({ length: slots }, (_, slot) => (
          <Box
            key={`slot-${slot}`}
            style={styles.segment}
            bg={slot < used ? colors.status.warning.main : colors.surface.elevated}
          />
        ))}
      </Box>
    </Box>
  );
});

/**
 * A calm stop instead of the builder: why the brand can't send right now, the one thing that
 * fixes it, and anything else that also stands in the way.
 */
const OfferBlockedComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { blockers, creatorName, preflight, isShortlisted, savingShortlist, onBlockerAction, onBack } =
    useOfferBuilder();
  const [first, ...rest] = blockers;
  const look = useBlockerLook(first ?? { code: null, label: '', dealId: null }, creatorName, isShortlisted);
  const styles = useStyles(
    ({ radii }): Record<'halo' | 'disc', ViewStyle> => ({
      halo: {
        width: DISC + HALO * 2,
        height: DISC + HALO * 2,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.soft,
      },
      disc: {
        width: DISC,
        height: DISC,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
      },
    }),
    [colors.brand.soft, colors.surface.main],
  );
  if (!first) return null;

  const usage = look.meter === 'openOffers' ? preflight?.openOffers : look.meter === 'drafts' ? preflight?.drafts : null;
  const Icon = look.icon;

  return (
    <Box flex={1} align="center" gap="xl" pt="2xl">
      <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify()} style={styles.halo}>
        <Box style={styles.disc} shadow="card">
          <Icon size={sizes.icon.xl} color={colors.brand.text} />
        </Box>
      </Animated.View>
      <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(120)}>
        <Box align="center" gap="sm">
          <Text variant="h3" color={colors.text.primary} align="center">
            {look.title}
          </Text>
          {look.body ? (
            <Text variant="body" color={colors.text.secondary} align="center">
              {look.body}
            </Text>
          ) : null}
        </Box>
      </Animated.View>
      {usage && look.meter ? (
        <UsageMeter
          label={
            look.meter === 'openOffers'
              ? t('marketplace.offer.blocked.offerLimit.meter')
              : t('marketplace.offer.blocked.draftLimit.meter')
          }
          used={usage.used}
          limit={usage.limit}
        />
      ) : null}
      <Box width="100%" gap="sm">
        <CustomButton
          title={look.cta}
          size="lg"
          fullWidth
          loading={first.code === 'deal_creator_unavailable' && savingShortlist}
          onPress={() => onBlockerAction(first)}
        />
        {first.code !== null ? (
          <CustomButton title={t('marketplace.offer.blocked.back')} variant="ghost" fullWidth onPress={onBack} />
        ) : null}
      </Box>
      {rest.length > 0 ? (
        <Box width="100%" gap="sm" p="lg" borderRadius="xl" bg={colors.surface.elevated}>
          <Text variant="overline" color={colors.text.tertiary}>
            {t('marketplace.offer.blocked.also')}
          </Text>
          {rest.map(blocker => (
            <Box key={blocker.code ?? blocker.label} row align="center" gap="sm">
              <Box width={sizes.icon.xs / 2} height={sizes.icon.xs / 2} borderRadius="full" bg={colors.status.warning.main} />
              <Box flex={1}>
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {blocker.label}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export const OfferBlocked = memo(OfferBlockedComponent);
