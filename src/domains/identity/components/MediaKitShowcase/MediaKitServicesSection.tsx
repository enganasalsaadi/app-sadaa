import React, { memo, useMemo } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { motion } from '@/core/theme';
import { Box, SectionHeader, Tabs } from '@/shared/ui';
import type { TabItem } from '@/shared/ui';
import type { MediaKitServicesModel } from '../../hooks/useMediaKitServices';
import { MediaKitServiceCard } from './MediaKitServiceCard';

interface MediaKitServicesSectionProps {
  services: MediaKitServicesModel;
  selectable: boolean;
}

/** Services under platform tabs (only when there is more than one); the cards fade in per tab. */
const MediaKitServicesSectionComponent: React.FC<MediaKitServicesSectionProps> = ({
  services,
  selectable,
}) => {
  const { t } = useTranslation();
  const { groups, activeGroup, onGroupChange, selected, toggleService } = services;

  const tabs = useMemo<TabItem<string>[]>(
    () =>
      groups.map(group => ({
        value: group.key,
        label: group.label ?? t('account.rates.inPerson'),
        count: group.services.length,
      })),
    [groups, t],
  );

  if (!activeGroup) return null;

  return (
    <Box px="xl" gap="md">
      <SectionHeader
        title={t('account.mediaKit.showcase.services.title')}
        subtitle={selectable ? t('account.mediaKit.showcase.services.pickHint') : undefined}
        emphasis="strong"
      />
      {tabs.length > 1 ? (
        <Tabs
          items={tabs}
          value={activeGroup.key}
          onChange={onGroupChange}
          scrollable={tabs.length > 3}
          accessibilityLabel={t('account.mediaKit.showcase.services.tabsA11y')}
        />
      ) : null}
      <Animated.View key={activeGroup.key} entering={FadeIn.duration(motion.duration.base)}>
        <Box gap="md">
          {activeGroup.services.map(service => (
            <MediaKitServiceCard
              key={service.key}
              service={service}
              selectable={selectable && service.price !== null}
              selected={selected.has(service.key)}
              onToggle={toggleService}
            />
          ))}
        </Box>
      </Animated.View>
    </Box>
  );
};

export const MediaKitServicesSection = memo(MediaKitServicesSectionComponent);
