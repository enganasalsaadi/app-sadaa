import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import {
  OPPORTUNITY_SEGMENTS,
  OPPORTUNITY_SEGMENT_LABEL,
  type OpportunitySegment,
} from '../constants/opportunities';

export interface OpportunityTabsProps {
  value: OpportunitySegment;
  onChange: (segment: OpportunitySegment) => void;
}

interface SegmentProps {
  segment: OpportunitySegment;
  selected: boolean;
  onSelect: (segment: OpportunitySegment) => void;
}

const SegmentComponent: React.FC<SegmentProps> = ({ segment, selected, onSelect }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const press = useCallback(() => onSelect(segment), [onSelect, segment]);
  const label = t(OPPORTUNITY_SEGMENT_LABEL[segment]);
  return (
    <Pressable
      flex={1}
      onPress={press}
      minHeight={sizes.button.md}
      px="sm"
      align="center"
      justify="center"
      borderRadius="full"
      bg={selected ? colors.button.primary.bg : colors.layout.transparent}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text
        variant={selected ? 'bodyMedium' : 'bodySmall'}
        color={selected ? colors.button.primary.text : colors.text.secondary}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const Segment = memo(SegmentComponent);

/** The tab's three destinations in one capsule: what fits you, what you saved, what you sent. */
const OpportunityTabsComponent: React.FC<OpportunityTabsProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box
      row
      p="xs"
      gap="xs"
      borderRadius="full"
      bg={colors.surface.elevated}
      accessibilityRole="tablist"
      accessibilityLabel={t('marketplace.campaign.feed.segmentsLabel')}
    >
      {OPPORTUNITY_SEGMENTS.map(segment => (
        <Segment key={segment} segment={segment} selected={segment === value} onSelect={onChange} />
      ))}
    </Box>
  );
};

export const OpportunityTabs = memo(OpportunityTabsComponent);
