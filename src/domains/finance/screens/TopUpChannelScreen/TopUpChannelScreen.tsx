import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, ErrorState, LayoutFooter, ListGroup, ListRow, Notice, Skeleton, Text } from '@/shared/ui';
import { TopUpStepLayout } from '../../components/TopUpStepLayout';
import type { PaymentChannel } from '../../types';
import {
  useTopUpChannelScreen,
  type ChannelGroupView,
  type ChannelOptionView,
} from './hooks/useTopUpChannelScreen';

const SKELETON_GROUPS = [2, 2, 1] as const;
const SKELETON_LABEL_WIDTH = moderateScale(96);
const SKELETON_LABEL_HEIGHT = moderateScale(12);

const ChannelRow = memo<{
  option: ChannelOptionView;
  selected: boolean;
  onSelect: (channel: PaymentChannel) => void;
}>(({ option, selected, onSelect }) => {
  const { t } = useTranslation();
  const { channel } = option;
  const handlePress = useCallback(() => onSelect(channel), [channel, onSelect]);
  return (
    <ListRow
      icon={option.icon}
      title={option.label}
      subtitle={option.caption}
      selected={selected}
      onPress={handlePress}
      disabled={!option.enabled}
      accessibilityLabel={t('finance.topUp.channel.optionA11y', { channel: option.label, caption: option.caption })}
    />
  );
});

const ChannelGroup = memo<{
  group: ChannelGroupView;
  selected: PaymentChannel | null;
  onSelect: (channel: PaymentChannel) => void;
}>(({ group, selected, onSelect }) => (
  <ListGroup title={group.label}>
    {group.options.map(option => (
      <ChannelRow
        key={option.channel}
        option={option}
        selected={option.channel === selected}
        onSelect={onSelect}
      />
    ))}
  </ListGroup>
));

const ChannelsSkeleton = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="xl" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {SKELETON_GROUPS.map((rows, index) => (
        <Box key={index} gap="sm">
          <Skeleton width={SKELETON_LABEL_WIDTH} height={SKELETON_LABEL_HEIGHT} borderRadius="xs" />
          <Skeleton width="100%" height={sizes.button.lg * rows} borderRadius="lg" />
        </Box>
      ))}
    </Box>
  );
});

/** Step 1 of the top-up wizard: pick the channel (grouped radio rows). */
const TopUpChannelScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useTopUpChannelScreen();

  return (
    <TopUpStepLayout
      step="channel"
      footer={
        vm.status === 'ready' ? (
          <LayoutFooter primary={{ label: t('finance.topUp.continue'), onPress: vm.onContinue }} />
        ) : undefined
      }
    >
      <Box gap="2xl">
        <Box gap="xs">
          <Text variant="h2">{t('finance.topUp.channel.title')}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {t('finance.topUp.channel.subtitle')}
          </Text>
        </Box>

        {vm.pausedNotice ? <Notice tone="warning" message={t('finance.topUp.channel.pausedNotice')} /> : null}
        {vm.rateNotice ? <Notice tone="warning" message={t('finance.topUp.channel.staleNotice')} /> : null}

        {vm.status === 'loading' ? <ChannelsSkeleton /> : null}
        {vm.status === 'error' ? (
          <ErrorState title={t('finance.topUp.channel.loadFailed')} onRetry={vm.retry} />
        ) : null}
        {vm.status === 'ready' ? (
          <Box gap="xl" accessibilityRole="radiogroup">
            {vm.groups.map(group => (
              <ChannelGroup key={group.key} group={group} selected={vm.selected} onSelect={vm.onSelect} />
            ))}
            {vm.error ? (
              <Text variant="caption" color={colors.status.danger.text} accessibilityLiveRegion="polite">
                {vm.error}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </TopUpStepLayout>
  );
};

export const TopUpChannelScreen = memo(TopUpChannelScreenComponent);
