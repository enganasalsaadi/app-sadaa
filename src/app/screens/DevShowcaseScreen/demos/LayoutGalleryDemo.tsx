import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { ListGroup } from '@/shared/ui';
import { ShowcaseLinkRow } from '../components';
import { useShowcaseNavigation } from '../hooks/useShowcaseNavigation';
import type { LayoutVariantScreenName } from '../hooks/useShowcaseNavigation';

interface LayoutGalleryRow {
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
}

/** Exhaustive: a new layout screen fails the build until it is listed here. */
const ROWS = {
  LayoutFixedHeaderScreen: {
    titleKey: 'devShowcase.layoutGallery.fixedHeaderTitle',
    descriptionKey: 'devShowcase.layoutGallery.fixedHeaderDescription',
  },
  LayoutHideOnScrollScreen: {
    titleKey: 'devShowcase.layoutGallery.hideOnScrollTitle',
    descriptionKey: 'devShowcase.layoutGallery.hideOnScrollDescription',
  },
  LayoutCollapseHeaderScreen: {
    titleKey: 'devShowcase.layoutGallery.collapseTitle',
    descriptionKey: 'devShowcase.layoutGallery.collapseDescription',
  },
  LayoutHeroOverlayScreen: {
    titleKey: 'devShowcase.layoutGallery.heroOverlayTitle',
    descriptionKey: 'devShowcase.layoutGallery.heroOverlayDescription',
  },
  LayoutStickyScreen: {
    titleKey: 'devShowcase.layoutGallery.stickyTitle',
    descriptionKey: 'devShowcase.layoutGallery.stickyDescription',
  },
  LayoutFooterElevateScreen: {
    titleKey: 'devShowcase.layoutGallery.footerElevateTitle',
    descriptionKey: 'devShowcase.layoutGallery.footerElevateDescription',
  },
  LayoutFabScreen: {
    titleKey: 'devShowcase.layoutGallery.fabTitle',
    descriptionKey: 'devShowcase.layoutGallery.fabDescription',
  },
  LayoutBrandHeaderScreen: {
    titleKey: 'devShowcase.layoutGallery.brandHeaderTitle',
    descriptionKey: 'devShowcase.layoutGallery.brandHeaderDescription',
  },
  LayoutDashboardScreen: {
    titleKey: 'devShowcase.layoutGallery.dashboardTitle',
    descriptionKey: 'devShowcase.layoutGallery.dashboardDescription',
  },
  LayoutNoHeaderScrollScreen: {
    titleKey: 'devShowcase.layoutGallery.noHeaderScrollTitle',
    descriptionKey: 'devShowcase.layoutGallery.noHeaderScrollDescription',
  },
  LayoutCtaButtonScreen: {
    titleKey: 'devShowcase.layoutGallery.ctaButtonTitle',
    descriptionKey: 'devShowcase.layoutGallery.ctaButtonDescription',
  },
  LayoutNoScrollWithHandlerScreen: {
    titleKey: 'devShowcase.layoutGallery.noScrollWithHandlerTitle',
    descriptionKey: 'devShowcase.layoutGallery.noScrollWithHandlerDescription',
  },
  LayoutListStatesScreen: {
    titleKey: 'devShowcase.layoutGallery.listStatesTitle',
    descriptionKey: 'devShowcase.layoutGallery.listStatesDescription',
  },
  LayoutHeroSheetScreen: {
    titleKey: 'devShowcase.layoutGallery.heroSheetTitle',
    descriptionKey: 'devShowcase.layoutGallery.heroSheetDescription',
  },
  LayoutWizardScreen: {
    titleKey: 'devShowcase.layoutGallery.wizardTitle',
    descriptionKey: 'devShowcase.layoutGallery.wizardDescription',
  },
  LayoutMoneyWizardScreen: {
    titleKey: 'devShowcase.layoutGallery.moneyWizardTitle',
    descriptionKey: 'devShowcase.layoutGallery.moneyWizardDescription',
  },
  LayoutGradientHeroScreen: {
    titleKey: 'devShowcase.layoutGallery.gradientHeroTitle',
    descriptionKey: 'devShowcase.layoutGallery.gradientHeroDescription',
  },
  LayoutDarkForcedScreen: {
    titleKey: 'devShowcase.layoutGallery.darkForcedTitle',
    descriptionKey: 'devShowcase.layoutGallery.darkForcedDescription',
  },
} as const satisfies Record<LayoutVariantScreenName, LayoutGalleryRow>;

const SCREENS = Object.keys(ROWS) as LayoutVariantScreenName[];

const LayoutGalleryDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useShowcaseNavigation();
  const onNavigate = useCallback(
    (screen: LayoutVariantScreenName) => navigation.navigate(screen),
    [navigation],
  );

  return (
    <ListGroup>
      {SCREENS.map(screen => (
        <ShowcaseLinkRow
          key={screen}
          id={screen}
          title={t(ROWS[screen].titleKey)}
          description={t(ROWS[screen].descriptionKey)}
          onPress={onNavigate}
        />
      ))}
    </ListGroup>
  );
};

export const LayoutGalleryDemo = memo(LayoutGalleryDemoComponent);
