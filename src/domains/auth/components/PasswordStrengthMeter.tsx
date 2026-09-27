import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { scorePassword } from '../utils/scorePassword';
import type { PasswordScore } from '../utils/scorePassword';

const LABEL_KEY = {
  1: 'auth.passwordStrength.weak',
  2: 'auth.passwordStrength.fair',
  3: 'auth.passwordStrength.strong',
} as const;

const SEGMENTS = [1, 2, 3] as const;

interface PasswordStrengthMeterProps {
  password: string;
}

/** Three-segment hint under the password; label text so it isn't color-only. */
const PasswordStrengthMeterComponent: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const score: PasswordScore = scorePassword(password);
  if (score === 0) return null;

  const tone = {
    1: colors.status.danger,
    2: colors.status.warning,
    3: colors.status.success,
  }[score];

  return (
    <Box
      row
      align="center"
      gap="sm"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <Box row flex={1} gap="xs">
        {SEGMENTS.map(segment => (
          <Box
            key={segment}
            flex={1}
            height={sizes.progress.track}
            borderRadius="full"
            bg={segment <= score ? tone.main : colors.border.default}
          />
        ))}
      </Box>
      <Text variant="caption" color={tone.text}>
        {t(LABEL_KEY[score])}
      </Text>
    </Box>
  );
};

export const PasswordStrengthMeter = memo(PasswordStrengthMeterComponent);
