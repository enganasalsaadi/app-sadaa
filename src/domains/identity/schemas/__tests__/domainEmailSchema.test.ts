import type { TFunction } from 'i18next';
import {
  createDomainEmailSchema,
  normalizeDomain,
  toStartDomainVerificationRequest,
  type DomainEmailFormValues,
} from '../domainEmailSchema';

const t = ((key: string) => key) as unknown as TFunction;
const schema = createDomainEmailSchema(t);

const errorsOf = (values: DomainEmailFormValues) => {
  try {
    schema.validateSync(values, { abortEarly: false });
    return {};
  } catch (error) {
    const { inner } = error as { inner: { path?: string; message: string }[] };
    return Object.fromEntries(inner.map(e => [e.path, e.message]));
  }
};

describe('normalizeDomain', () => {
  it.each([
    ['mybrand.sy', 'mybrand.sy'],
    ['  MyBrand.COM ', 'mybrand.com'],
    ['https://www.mybrand.com/about?x=1', 'mybrand.com'],
    ['mybrand.com:8080', 'mybrand.com'],
    ['shop.mybrand.com.', 'shop.mybrand.com'],
  ])('%s → %s', (raw, expected) => {
    expect(normalizeDomain(raw)).toBe(expected);
  });
});

describe('createDomainEmailSchema', () => {
  it('passes an email on the entered domain', () => {
    expect(errorsOf({ domain: 'https://www.mybrand.sy', email: 'Admin@MyBrand.sy' })).toEqual({});
  });

  it('requires both fields', () => {
    expect(errorsOf({ domain: '', email: ' ' })).toEqual({
      domain: 'account.verification.domain.errors.domainRequired',
      email: 'account.verification.domain.errors.emailRequired',
    });
  });

  it('rejects a domain without a TLD', () => {
    expect(errorsOf({ domain: 'mybrand', email: 'admin@mybrand.com' }).domain).toBe(
      'account.verification.domain.errors.domainInvalid',
    );
  });

  it('rejects a public mail provider', () => {
    expect(errorsOf({ domain: 'gmail.com', email: 'me@gmail.com' }).domain).toBe(
      'account.verification.domain.errors.publicDomain',
    );
  });

  it('rejects an email on another domain', () => {
    expect(errorsOf({ domain: 'mybrand.com', email: 'admin@gmail.com' })).toEqual({
      email: 'account.verification.domain.errors.emailMismatch',
    });
  });

  it('rejects a subdomain email: it must end with @domain', () => {
    expect(errorsOf({ domain: 'mybrand.com', email: 'admin@mail.mybrand.com' }).email).toBe(
      'account.verification.domain.errors.emailMismatch',
    );
  });

  it('skips the mismatch check while the domain is invalid', () => {
    expect(errorsOf({ domain: 'mybrand', email: 'admin@other.com' }).email).toBeUndefined();
  });

  it('rejects a malformed email', () => {
    expect(errorsOf({ domain: 'mybrand.com', email: 'admin@' }).email).toBe(
      'account.verification.domain.errors.emailInvalid',
    );
  });
});

describe('toStartDomainVerificationRequest', () => {
  it('sends the normalised domain and email', () => {
    expect(
      toStartDomainVerificationRequest({ domain: 'www.MyBrand.sy/', email: ' Admin@MyBrand.sy ' }),
    ).toEqual({ domain: 'mybrand.sy', email: 'admin@mybrand.sy' });
  });
});
