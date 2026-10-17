import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, Package, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CreatorCampaign } from '../types/campaign';
import { isAlreadyApplied } from '../utils/opportunities';

interface BadgeProps {
  label: string;
  icon: LucideIcon;
  bg: string;
  ink: string;
}

const Badge = memo<BadgeProps>(({ label, icon: Icon, bg, ink }) => {
  const { sizes } = useTheme();
  return (
    <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={bg}>
      <Icon size={sizes.icon.xs} color={ink} strokeWidth={iconStroke.bold} />
      <Text variant="label" color={ink} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );
});

export interface OpportunityBadgesProps {
  campaign: Pick<CreatorCampaign, 'invited' | 'budgetSecured' | 'shippingMode' | 'eligibility'>;
}

/** What sets a campaign apart, at the cover's foot: applied already, invited (gold), budget secured (mint), a product on its way (neutral). */
const OpportunityBadgesComponent: React.FC<OpportunityBadgesProps> = ({ campaign }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { invited, budgetSecured, shippingMode } = campaign;
  const ships = shippingMode.key === 'gift' || shippingMode.key === 'returnable';
  const applied = isAlreadyApplied(campaign);
  if (!applied && !invited && !budgetSecured && !ships) return null;

  return (
    <Box row wrap gap="sm">
      {applied ? (
        <Badge
          label={t('marketplace.campaign.feed.card.applied')}
          icon={CheckCheck}
          bg={colors.interactive.soft}
          ink={colors.interactive.text}
        />
      ) : null}
      {invited ? (
        <Badge
          label={t('marketplace.campaign.feed.card.invited')}
          icon={Sparkles}
          bg={colors.premium.soft}
          ink={colors.premium.text}
        />
      ) : null}
      {budgetSecured ? (
        <Badge
          label={t('marketplace.campaign.feed.card.secured')}
          icon={ShieldCheck}
          bg={colors.money.soft}
          ink={colors.money.text}
        />
      ) : null}
      {ships ? (
        <Badge
          label={t(
            shippingMode.key === 'returnable'
              ? 'marketplace.campaign.feed.card.shipReturn'
              : 'marketplace.campaign.feed.card.shipGift',
          )}
          icon={Package}
          bg={colors.surface.main}
          ink={colors.text.primary}
        />
      ) : null}
    </Box>
  );
};

export const OpportunityBadges = memo(OpportunityBadgesComponent);
