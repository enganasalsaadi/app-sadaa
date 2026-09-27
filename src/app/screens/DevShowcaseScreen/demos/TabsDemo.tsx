import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader, Tabs } from '@/shared/ui';
import { useTabsDemo } from './hooks/useTabsDemo';

const TabsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useTabsDemo();

  return (
    <Box gap="lg">
      <SectionHeader title={t('devShowcase.tabs.fixedTitle')} />
      <Tabs
        items={demo.inboxItems}
        value={demo.inboxTab}
        onChange={demo.setInboxTab}
        accessibilityLabel={t('devShowcase.tabs.inboxLabel')}
      />
      <SectionHeader title={t('devShowcase.tabs.scrollableTitle')} />
      <Tabs
        items={demo.nicheItems}
        value={demo.nicheTab}
        onChange={demo.setNicheTab}
        accessibilityLabel={t('devShowcase.tabs.nicheLabel')}
        scrollable
      />
    </Box>
  );
};

export const TabsDemo = memo(TabsDemoComponent);
