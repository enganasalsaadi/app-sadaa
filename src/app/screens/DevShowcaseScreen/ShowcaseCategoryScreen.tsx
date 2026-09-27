import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Layout } from '@/shared/ui';
import { ShowcaseSection } from './components';
import { useShowcaseCategoryScreen } from './hooks';
import { SHOWCASE_DEMOS } from './registry/showcaseDemos';
import { SHOWCASE_ENTRIES } from './registry/showcaseRegistry';

/** One category of the kit catalog: every registry entry's demo, in registry order. */
const ShowcaseCategoryScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { titleKey, entryIds } = useShowcaseCategoryScreen();

  return (
    <Layout header={{ title: t(titleKey) }}>
      <Box gap="xl">
        {entryIds.map(id => {
          const Demo = SHOWCASE_DEMOS[id];
          return (
            <ShowcaseSection key={id} title={t(SHOWCASE_ENTRIES[id].titleKey)}>
              <Demo />
            </ShowcaseSection>
          );
        })}
      </Box>
    </Layout>
  );
};

export const ShowcaseCategoryScreen = memo(ShowcaseCategoryScreenComponent);
