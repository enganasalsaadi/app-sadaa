import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Layout, ListGroup } from '@/shared/ui';
import { ShowcaseLinkRow, TopControlBar } from './components';
import { useDevShowcaseScreen } from './hooks';
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_CATEGORY_ORDER,
} from './registry/showcaseRegistry';

/**
 * Dev-only UI-kit catalog, reachable from the Profile screen's `__DEV__` row.
 * Every `@/shared/ui` export must appear in a category (registry test, rule 10).
 */
const DevShowcaseScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const {
    themeMode,
    isRTL,
    language,
    toggleTheme,
    setThemeMode,
    openCategory,
  } = useDevShowcaseScreen();

  return (
    <Layout header={{ title: t('devShowcase.title') }}>
      <Box gap="md">
        <TopControlBar
          themeMode={themeMode}
          isRTL={isRTL}
          language={language}
          onToggleTheme={toggleTheme}
          onSetThemeMode={setThemeMode}
        />
        <ListGroup>
          {SHOWCASE_CATEGORY_ORDER.map(category => (
            <ShowcaseLinkRow
              key={category}
              id={category}
              title={t(SHOWCASE_CATEGORIES[category].titleKey)}
              description={t(SHOWCASE_CATEGORIES[category].descriptionKey)}
              onPress={openCategory}
            />
          ))}
        </ListGroup>
      </Box>
    </Layout>
  );
};

export const DevShowcaseScreen = memo(DevShowcaseScreenComponent);
