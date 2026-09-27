import type { TFunction } from 'i18next';
import { createBrandAccountSchema } from '../brandAccountSchema';
import type { BrandAccountFormValues } from '../brandAccountSchema';
import { createOtpSchema } from '../otpSchema';
import { createLoginSchema, createPhoneSchema } from '../loginSchema';
import { createNewPasswordSchema } from '../passwordFields';
import {
  createBrandProfileSchema,
  EMPTY_SOCIAL_LINKS,
  toSocialLinksForm,
} from '../brandProfileSchema';

// Echo the key so assertions read the message that would be shown.
const t = ((key: string) => key) as unknown as TFunction;

const validAccount: BrandAccountFormValues = {
  companyName: 'Sada Store',
  phone: '944123456',
  countryCode: 'SY',
  email: 'hello@sada.sy',
  password: 'secret123',
  passwordConfirmation: 'secret123',
};

const messageOf = (fn: () => unknown) => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('brandAccountSchema', () => {
  const schema = createBrandAccountSchema(t);

  it('accepts a valid account', () => {
    expect(schema.isValidSync(validAccount)).toBe(true);
  });

  it.each([
    ['companyName', '   ', 'validation.required'],
    ['phone', '12', 'validation.invalidPhone'],
    ['email', 'not-an-email', 'validation.invalidEmail'],
    ['password', 'short', 'validation.minLength'],
  ] as const)('rejects %s = %p', (field, value, message) => {
    expect(
      messageOf(() => schema.validateSyncAt(field, { ...validAccount, [field]: value })),
    ).toBe(message);
  });

  it('validates the phone against the selected country', () => {
    expect(
      schema.isValidSync({ ...validAccount, countryCode: 'US', phone: '944123456' }),
    ).toBe(false);
  });

  it('requires matching passwords', () => {
    expect(
      messageOf(() =>
        schema.validateSync({ ...validAccount, passwordConfirmation: 'other1234' }),
      ),
    ).toBe('validation.passwordMismatch');
  });
});

describe('otpSchema', () => {
  const schema = createOtpSchema(t, 4);
  it.each([
    ['1234', true],
    ['123', false],
    ['12a4', false],
    ['12345', false],
  ])('%s → %s', (code, valid) => {
    expect(schema.isValidSync({ code })).toBe(valid);
  });
});

describe('brandProfileSchema', () => {
  const schema = createBrandProfileSchema(t);
  const valid = {
    governorate: 'damascus',
    businessType: 'retail',
    socialLinks: EMPTY_SOCIAL_LINKS,
  };

  it('accepts a profile with no social links', () => {
    expect(schema.isValidSync(valid)).toBe(true);
  });

  it('requires governorate and business type', () => {
    expect(schema.isValidSync({ ...valid, governorate: '' })).toBe(false);
    expect(schema.isValidSync({ ...valid, businessType: '' })).toBe(false);
  });

  it('rejects a link on the wrong host', () => {
    expect(
      messageOf(() =>
        schema.validateSync({
          ...valid,
          socialLinks: { ...EMPTY_SOCIAL_LINKS, instagram: 'https://evil.com/x' },
        }),
      ),
    ).toBe('validation.invalidSocialLink');
  });

  it('accepts handles and full URLs', () => {
    expect(
      schema.isValidSync({
        ...valid,
        socialLinks: {
          ...EMPTY_SOCIAL_LINKS,
          instagram: '@brand',
          website: 'brand.sy',
        },
      }),
    ).toBe(true);
  });
});

describe('toSocialLinksForm', () => {
  it('maps known platforms and drops unknown ones', () => {
    expect(
      toSocialLinksForm([
        { platform: 'instagram', url: 'https://instagram.com/a' },
        { platform: 'snapchat', url: 'https://snapchat.com/a' },
      ]),
    ).toEqual({ ...EMPTY_SOCIAL_LINKS, instagram: 'https://instagram.com/a' });
  });
});

describe('loginSchema', () => {
  const schema = createLoginSchema(t);
  const valid = { phone: '944123456', countryCode: 'SY' as const, password: 'x' };

  it('accepts any non-empty password (server decides)', () => {
    expect(schema.isValidSync(valid)).toBe(true);
  });

  it('rejects a number invalid for the selected country', () => {
    expect(messageOf(() => schema.validateSyncAt('phone', { ...valid, countryCode: 'SA' }))).toBe(
      'validation.invalidPhone',
    );
  });

  it('requires the password', () => {
    expect(messageOf(() => schema.validateSyncAt('password', { ...valid, password: '' }))).toBe(
      'validation.required',
    );
  });
});

describe('phoneSchema', () => {
  it('requires a phone', () => {
    const schema = createPhoneSchema(t);
    expect(messageOf(() => schema.validateSyncAt('phone', { phone: '', countryCode: 'SY' }))).toBe(
      'validation.required',
    );
  });
});

describe('newPasswordSchema', () => {
  const schema = createNewPasswordSchema(t);

  it('accepts a matching 8+ char password', () => {
    expect(schema.isValidSync({ password: 'secret123', passwordConfirmation: 'secret123' })).toBe(
      true,
    );
  });

  it.each([
    ['password', { password: 'short', passwordConfirmation: 'short' }, 'validation.minLength'],
    [
      'passwordConfirmation',
      { password: 'secret123', passwordConfirmation: 'secret124' },
      'validation.passwordMismatch',
    ],
  ] as const)('%s → %s', (path, values, message) => {
    expect(messageOf(() => schema.validateSyncAt(path, values))).toBe(message);
  });
});
