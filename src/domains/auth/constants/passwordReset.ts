import type { WizardStepDef } from './wizard';

export type PasswordResetStepKey = 'phone' | 'code' | 'password';

export const PASSWORD_RESET_STEPS = {
  phone: {
    index: 1,
    titleKey: 'auth.passwordReset.phone.title',
    subtitleKey: 'auth.passwordReset.phone.subtitle',
  },
  code: {
    index: 2,
    titleKey: 'auth.passwordReset.code.title',
    subtitleKey: 'auth.passwordReset.code.subtitle',
  },
  password: {
    index: 3,
    titleKey: 'auth.passwordReset.password.title',
    subtitleKey: 'auth.passwordReset.password.subtitle',
  },
} as const satisfies Record<PasswordResetStepKey, WizardStepDef>;

export const PASSWORD_RESET_TOTAL_STEPS = Object.keys(PASSWORD_RESET_STEPS).length;

export const RESET_OTP_LENGTH = 4;
/** Resend throttle, mirrors the server (60s). */
export const RESET_OTP_RESEND_SECONDS = 60;
