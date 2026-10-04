import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { SocialPlatform } from '@/shared/utils';
import type { BrandProfileFormValues } from '../schemas';
import { SocialLinkInput } from './SocialLinkInput';

interface SocialLinkFieldProps {
  platform: SocialPlatform;
  control: Control<BrandProfileFormValues>;
}

/** `SocialLinkInput` bound to the onboarding profile form. */
const SocialLinkFieldComponent: React.FC<SocialLinkFieldProps> = ({ platform, control }) => (
  <Controller
    control={control}
    name={`socialLinks.${platform}`}
    render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
      <SocialLinkInput
        inputRef={ref}
        platform={platform}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={fieldState.error?.message}
      />
    )}
  />
);

export const SocialLinkField = memo(SocialLinkFieldComponent);
