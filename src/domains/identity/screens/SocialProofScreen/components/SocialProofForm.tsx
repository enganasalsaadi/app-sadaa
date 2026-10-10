import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import { Link2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomInput,
  ListGroup,
  ListRow,
  Text,
  Timeline,
} from '@/shared/ui';
import {
  VERIFICATION_FIELD_MAX_LENGTH,
  SOCIAL_PROOF_PLATFORM_LABEL,
} from '../../../constants/verification';
import { SOCIAL_PROOF_PLATFORMS } from '../../../types/verification';
import type { SocialProofFormModel } from '../hooks/useSocialProofScreen';

const PlatformPicker: React.FC<{ form: SocialProofFormModel }> = memo(
  ({ form }) => {
    const { t } = useTranslation();
    const platform = useWatch({ control: form.control, name: 'platform' });
    return (
      <ListGroup title={t('account.verification.social.form.platformLabel')}>
        {SOCIAL_PROOF_PLATFORMS.map(option => (
          <ListRow
            key={option}
            title={t(SOCIAL_PROOF_PLATFORM_LABEL[option])}
            selected={platform === option}
            onPress={() => form.onPlatformChange(option)}
          />
        ))}
      </ListGroup>
    );
  },
);

const PageUrlField: React.FC<{ form: SocialProofFormModel }> = memo(
  ({ form }) => {
    const { t } = useTranslation();
    const { sizes } = useTheme();
    const platform = useWatch({ control: form.control, name: 'platform' });
    return (
      <Controller
        control={form.control}
        name="pageUrl"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('account.verification.social.form.urlLabel')}
            placeholder={t('account.verification.social.form.urlLabel')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            hint={form.urlExample(platform)}
            leftIcon={<Link2 size={sizes.icon.sm} />}
            keyboardType="url"
            textContentType="URL"
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={form.onSubmit}
            maxLength={VERIFICATION_FIELD_MAX_LENGTH}
          />
        )}
      />
    );
  },
);

/** Board 4: platform + page link, and how the manual check works before the code exists. */
const SocialProofFormComponent: React.FC<{ form: SocialProofFormModel }> = ({
  form,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="2xl">
      <Box gap="sm">
        <Text variant="h2">
          {t('account.verification.social.form.heading')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('account.verification.social.form.subtitle')}
        </Text>
      </Box>
      <PlatformPicker form={form} />
      <PageUrlField form={form} />
      <Card p="lg">
        <Box gap="md">
          <Text variant="label" color={colors.text.secondary}>
            {t('account.verification.social.form.howTitle')}
          </Text>
          <Timeline steps={form.howSteps} variant="steps" />
        </Box>
      </Card>
    </Box>
  );
};

export const SocialProofForm = memo(SocialProofFormComponent);
