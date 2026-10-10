import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, InlineError, Layout, LayoutFooter, Text } from '@/shared/ui';
import { VerificationMethodList } from '../../components/VerificationMethodList';
import { useBrandVerificationStepScreen } from './hooks/useBrandVerificationStepScreen';

/**
 * Wizard step (registration step 4, injected into the brand wizard by the app): tapping a
 * method is the action, so the footer holds only Skip (rule 09 §5).
 */
const BrandVerificationStepScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { onSelect, onSkip, isSkipping, error } = useBrandVerificationStepScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          top={
            <Text variant="caption" align="center" color={colors.text.secondary}>
              {t('account.verification.picker.skipHint')}
            </Text>
          }
          secondary={{
            label: t('account.verification.picker.skip'),
            onPress: onSkip,
            loading: isSkipping,
          }}
        />
      }
    >
      <Box gap="lg" pb="xl">
        <Text variant="body" color={colors.text.secondary}>
          {t('account.verification.picker.onboardingLead')}
        </Text>
        <VerificationMethodList variant="compact" onSelect={onSelect} />
        <InlineError error={error} />
      </Box>
    </Layout>
  );
};

export const BrandVerificationStepScreen = memo(BrandVerificationStepScreenComponent);
