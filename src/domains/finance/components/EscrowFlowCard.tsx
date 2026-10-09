import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, UserRound, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Divider, Image, MoneyFlow, MoneyText, StatusPill, Text } from '@/shared/ui';

/** Tile size of a flow node (wallet, escrow, the other party). */
const NODE = moderateScale(52);
/** Room for the node's label under it. */
const NODE_COLUMN = moderateScale(80);

/** `party`: the brand or creator on the other side; `partyIcon` when there is no one yet (explainer). */
export type EscrowFlowNodeKind = 'wallet' | 'escrow' | 'party';

export interface EscrowFlowNode {
  key: string;
  kind: EscrowFlowNodeKind;
  label: string;
  avatarUrl?: string | null;
  /** Explainer only: a generic brand / creator glyph instead of an avatar. */
  partyIcon?: 'brand' | 'creator';
}

export interface EscrowFlowCardProps {
  title: string;
  /** Money order: from (reading start) → Sada escrow → to. */
  nodes: readonly [EscrowFlowNode, EscrowFlowNode, EscrowFlowNode];
  /** `live`: money is held now, mint dots flow · `explainer`: how escrow works, still line. */
  variant: 'live' | 'explainer';
  /** Live: the amount held (creator: net to receive · brand: gross held). */
  amount?: Money | null;
  /** Live: what releases the money · explainer: the one-line explanation. */
  caption: string;
  hidden?: boolean;
}

const PartyTile = memo<{ node: EscrowFlowNode }>(({ node }) => {
  const { colors, sizes } = useTheme();
  if (node.avatarUrl) {
    return <Image uri={node.avatarUrl} size={NODE} borderRadius="md" />;
  }
  if (node.partyIcon) {
    const Icon = node.partyIcon === 'brand' ? Building2 : UserRound;
    return (
      <Box width={NODE} height={NODE} borderRadius="md" bg={colors.surface.elevated} align="center" justify="center">
        <Icon size={sizes.icon.md} color={colors.icon.secondary} />
      </Box>
    );
  }
  return (
    <Box width={NODE} height={NODE} borderRadius="md" bg={colors.brand.soft} align="center" justify="center">
      <Text variant="title" color={colors.brand.text}>
        {Array.from(node.label.trim())[0] ?? ''}
      </Text>
    </Box>
  );
});

const IconTile = memo<{ icon: LucideIcon; bg: string; color: string }>(({ icon: Icon, bg, color }) => {
  const { sizes } = useTheme();
  return (
    <Box width={NODE} height={NODE} borderRadius="md" bg={bg} align="center" justify="center">
      <Icon size={sizes.icon.md} color={color} />
    </Box>
  );
});

const FlowNodeView = memo<{ node: EscrowFlowNode }>(({ node }) => {
  const { colors } = useTheme();
  return (
    <Box width={NODE_COLUMN} align="center" gap="xs">
      {node.kind === 'wallet' ? (
        <IconTile icon={Wallet} bg={colors.money.soft} color={colors.money.main} />
      ) : node.kind === 'escrow' ? (
        <IconTile icon={ShieldCheck} bg={colors.interactive.soft} color={colors.interactive.main} />
      ) : (
        <PartyTile node={node} />
      )}
      <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1}>
        {node.label}
      </Text>
    </Box>
  );
});

const Connector = memo<{ live: boolean }>(({ live }) => (
  <Box flex={1} height={NODE} justify="center">
    {live ? <MoneyFlow /> : <Divider />}
  </Box>
));

/**
 * Where held money sits: the payer, Sada's escrow, the payee, with mint dots flowing
 * between them while it is held (rule 09 §3.1 money flow). The explainer variant shows
 * the same path, still, before any deal.
 */
const EscrowFlowCardComponent: React.FC<EscrowFlowCardProps> = ({
  title,
  nodes,
  variant,
  amount,
  caption,
  hidden = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const live = variant === 'live';
  const [from, escrow, to] = nodes;

  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="center" justify="space-between" gap="sm">
          <Box flex={1}>
            <Text variant="title" numberOfLines={1}>
              {title}
            </Text>
          </Box>
          <StatusPill label={t('finance.wallet.escrowCard.protected')} tone="interactive" icon={ShieldCheck} size="sm" />
        </Box>

        <Box
          row
          align="flex-start"
          accessible
          accessibilityLabel={t('finance.wallet.escrowCard.flowA11y', {
            from: from.label,
            escrow: escrow.label,
            to: to.label,
          })}
        >
          <FlowNodeView node={from} />
          <Connector live={live} />
          <FlowNodeView node={escrow} />
          <Connector live={live} />
          <FlowNodeView node={to} />
        </Box>

        <Divider />
        {live && amount ? (
          <Box gap="xs">
            <MoneyText value={amount} size="title" tone="money" hidden={hidden} />
            <Text variant="caption" color={colors.text.tertiary}>
              {caption}
            </Text>
          </Box>
        ) : (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {caption}
          </Text>
        )}
      </Box>
    </Card>
  );
};

export const EscrowFlowCard = memo(EscrowFlowCardComponent);
