import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, SegmentedControl, Text, type SegmentedOption } from '@/shared/ui';
import type { CampaignTab } from '../constants/campaignStatus';
import type { CampaignAttention } from '../utils/campaignList';
import { CampaignAttentionRail } from './CampaignAttentionRail';
import { CampaignScopeSwitch } from './CampaignScopeSwitch';
import type { CampaignScope } from './CampaignScopeSwitch';

export interface CampaignsListHeaderProps {
  scope: CampaignScope;
  onScope: (scope: CampaignScope) => void;
  /** «5 campaigns running • 3 applications waiting»; `null` until the tab has loaded. */
  subtitle: string | null;
  needsYou: readonly CampaignAttention[];
  onAttention: (item: CampaignAttention) => void;
  options: readonly SegmentedOption<CampaignTab>[];
  tab: CampaignTab;
  onTab: (tab: CampaignTab) => void;
  onNewCampaign: () => void;
}

/** The campaigns list's fixed top: the scope switch with «new campaign», what needs a decision, and the four status tabs. */
const CampaignsListHeaderComponent: React.FC<CampaignsListHeaderProps> = ({
  scope,
  onScope,
  subtitle,
  needsYou,
  onAttention,
  options,
  tab,
  onTab,
  onNewCampaign,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    ({ spacing }): Record<'header', ViewStyle> => ({
      header: {
        paddingTop: top + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
        gap: spacing.md,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.layout.base, top],
  );

  return (
    <Box style={styles.header}>
      <Box row align="flex-end" justify="space-between" gap="md">
        <CampaignScopeSwitch scope={scope} onScope={onScope} />
        <IconButton
          icon={Plus}
          variant="solid"
          onPress={onNewCampaign}
          accessibilityLabel={t('marketplace.deals.newCampaign')}
        />
      </Box>
      {subtitle ? (
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
      <CampaignAttentionRail items={needsYou} onOpen={onAttention} />
      <SegmentedControl
        options={options}
        value={tab}
        onChange={onTab}
        accessibilityLabel={t('marketplace.campaign.list.tabsLabel')}
      />
    </Box>
  );
};

export const CampaignsListHeader = memo(CampaignsListHeaderComponent);
