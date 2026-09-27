import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, moderateScale } from '@/core/theme';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { CustomButton } from '@/shared/ui';
import { useAppSelector } from '@/core/store';
import {
  selectCurrentStep,
  selectUserType,
  useLogoutMutation,
} from '@/domains/auth';

// Stub landing spot for a logged-in user whose server-side registration
// wizard isn't finished (`is_onboarding_complete: false` from /auth/login).
// The real per-role, multi-step onboarding UI is a separate future task —
// this just avoids stranding the user with no way forward but logout.
const OnboardingResumeScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const userType = useAppSelector(selectUserType);
  const currentStep = useAppSelector(selectCurrentStep);
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <Box
      flex={1}
      bg={colors.layout.base}
      align="center"
      justify="center"
      px="3xl"
      style={{ paddingTop: top, paddingBottom: bottom + moderateScale(24) }}
    >
      <Box
        width={moderateScale(80)}
        height={moderateScale(80)}
        borderRadius="lg"
        bg={colors.surface.elevated}
        align="center"
        justify="center"
        mb="2xl"
      >
        <UserCheck size={moderateScale(36)} color={colors.interactive.main} />
      </Box>

      <Text variant="h2" color={colors.text.primary} align="center" mb="md">
        {t('account.onboardingResume.title')}
      </Text>

      <Text variant="body" color={colors.text.secondary} align="center" mb="3xl">
        {userType && currentStep != null
          ? t('account.onboardingResume.subtitleWithStep', { userType, currentStep })
          : t('account.onboardingResume.subtitle')}
      </Text>

      <CustomButton
        title={t('account.onboardingResume.logout')}
        onPress={() => logout({})}
        loading={isLoading}
        disabled={isLoading}
        variant="ghost"
        fullWidth
      />
    </Box>
  );
};

export const OnboardingResumeScreen = memo(OnboardingResumeScreenComponent);
