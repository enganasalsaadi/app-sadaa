import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import {
  Box,
  Layout,
  LayoutFooter,
  Skeleton,
  Text,
  WizardShell,
  useWizardHeader,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import {
  WIZARD_DEMO_TOTAL,
  useLayoutWizardStep,
} from './hooks/useLayoutWizardStep';

const STEP_TITLE_KEY: readonly ParseKeys[] = [
  'devShowcase.wizard.step1',
  'devShowcase.wizard.step2',
  'devShowcase.wizard.step3',
];

const WizardDemoStep: React.FC = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { step, isLast, onBack, onNext } = useLayoutWizardStep();
  const title = t(STEP_TITLE_KEY[step - 1] ?? 'devShowcase.wizard.step1');

  useWizardHeader({
    step,
    title,
    subtitle: t('devShowcase.wizard.subtitle'),
    onBack,
  });

  return (
    <Layout
      footer={
        <LayoutFooter
          primary={{
            label: t(isLast ? 'common.done' : 'common.next'),
            onPress: onNext,
          }}
        />
      }
    >
      <Box gap="lg">
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.wizard.body')}
        </Text>
        <Skeleton width="100%" height={sizes.input.md} borderRadius="md" />
        <Skeleton width="100%" height={sizes.input.md} borderRadius="md" />
      </Box>
    </Layout>
  );
});

/** Wizard archetype (rule 09): `WizardShell` header persists while the step content changes. */
const LayoutWizardScreenComponent: React.FC = () => (
  <WizardShell total={WIZARD_DEMO_TOTAL}>
    <WizardDemoStep />
  </WizardShell>
);

export const LayoutWizardScreen = memo(LayoutWizardScreenComponent);
