import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { motion, moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

export type CampaignScope = 'campaigns' | 'deals';

const UNDERLINE_WIDTH = moderateScale(46);
const UNDERLINE_HEIGHT = moderateScale(4);
const TOUCH = moderateScale(44);

export interface CampaignScopeSwitchProps {
  scope: CampaignScope;
  onScope: (scope: CampaignScope) => void;
}

interface ScopeLabelProps {
  value: CampaignScope;
  active: boolean;
  onScope: (scope: CampaignScope) => void;
}

const ScopeLabelComponent: React.FC<ScopeLabelProps> = ({ value, active, onScope }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const label = t(value === 'campaigns' ? 'marketplace.campaign.list.scope.campaigns' : 'marketplace.campaign.list.scope.deals');

  return (
    <Pressable
      onPress={() => onScope(value)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      minHeight={TOUCH}
      justify="flex-end"
    >
      <Text
        variant={active ? 'h1' : 'h3'}
        color={active ? colors.brand.text : colors.text.tertiary}
        accessibilityRole={active ? 'header' : undefined}
      >
        {label}
      </Text>
      <Box height={UNDERLINE_HEIGHT} mt="xs">
        {active ? (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}>
            <Box width={UNDERLINE_WIDTH} height={UNDERLINE_HEIGHT} borderRadius="full" bg={colors.interactive.main} />
          </Animated.View>
        ) : null}
      </Box>
    </Pressable>
  );
};

const ScopeLabel = memo(ScopeLabelComponent);

/** The root's title is the switch: «My campaigns» big, «My deals» beside it, a teal bar under the one you are on. */
const CampaignScopeSwitchComponent: React.FC<CampaignScopeSwitchProps> = ({ scope, onScope }) => (
  <Box row align="flex-end" gap="xl" accessibilityRole="tablist">
    <ScopeLabel value="campaigns" active={scope === 'campaigns'} onScope={onScope} />
    <ScopeLabel value="deals" active={scope === 'deals'} onScope={onScope} />
  </Box>
);

export const CampaignScopeSwitch = memo(CampaignScopeSwitchComponent);
