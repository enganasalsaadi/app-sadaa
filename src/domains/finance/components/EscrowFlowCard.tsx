import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, UserRound, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, Divider, StatusPill, Text } from '@/shared/ui';

/** Tile size of a flow node (wallet, escrow, the other party). */
const NODE = moderateScale(52);
/** Room for the node's label under it. */
const NODE_COLUMN = moderateScale(80);

/** `party`: the brand or creator on the other side, as a generic glyph. */
export type EscrowFlowNodeKind = 'wallet' | 'escrow' | 'party';

export interface EscrowFlowNode {
  key: string;
  kind: EscrowFlowNodeKind;
  label: string;
  /** Party only: a brand or a creator glyph. */
  partyIcon?: 'brand' | 'creator';
}

export interface EscrowFlowCardProps {
  title: string;
  /** Money order: from (reading start) → Sada escrow → to. */
  nodes: readonly [EscrowFlowNode, EscrowFlowNode, EscrowFlowNode];
  /** The one-line explanation. */
  caption: string;
}

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
        <IconTile
          icon={node.partyIcon === 'creator' ? UserRound : Building2}
          bg={colors.surface.elevated}
          color={colors.icon.secondary}
        />
      )}
      <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={1}>
        {node.label}
      </Text>
    </Box>
  );
});

const Connector = memo(() => (
  <Box flex={1} height={NODE} justify="center">
    <Divider />
  </Box>
));

/**
 * How escrow works, before any deal: the payer, Sada's escrow and the payee on one still
 * path, with the one-line explanation (wallet tab, no active escrow).
 */
const EscrowFlowCardComponent: React.FC<EscrowFlowCardProps> = ({ title, nodes, caption }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
          <Connector />
          <FlowNodeView node={escrow} />
          <Connector />
          <FlowNodeView node={to} />
        </Box>

        <Divider />
        <Text variant="bodySmall" color={colors.text.secondary}>
          {caption}
        </Text>
      </Box>
    </Card>
  );
};

export const EscrowFlowCard = memo(EscrowFlowCardComponent);
