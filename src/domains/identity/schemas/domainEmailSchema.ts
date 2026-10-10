import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { PUBLIC_EMAIL_DOMAINS, VERIFICATION_FIELD_MAX_LENGTH } from '../constants/verification';
import type { StartDomainVerificationRequest } from '../types/verification';

export interface DomainEmailFormValues {
  domain: string;
  email: string;
}

const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

/** `https://www.Brand.com/about` → `brand.com`: people paste their site URL, the server wants `host.tld`. */
export const normalizeDomain = (raw: string): string =>
  raw
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/?#:].*$/, '')
    .replace(/\.$/, '');

const isValidDomain = (domain: string) => DOMAIN_REGEX.test(domain);

const isPublicEmailDomain = (domain: string) => PUBLIC_EMAIL_DOMAINS.includes(domain);

const normalizeEmail = (raw: string) => raw.trim().toLowerCase();

export const createDomainEmailSchema = (t: TFunction): yup.ObjectSchema<DomainEmailFormValues> =>
  yup.object({
    domain: yup
      .string()
      .defined()
      .test('domain', function (value) {
        const domain = normalizeDomain(value);
        if (!domain) {
          return this.createError({ message: t('account.verification.domain.errors.domainRequired') });
        }
        if (!isValidDomain(domain) || domain.length > VERIFICATION_FIELD_MAX_LENGTH) {
          return this.createError({ message: t('account.verification.domain.errors.domainInvalid') });
        }
        return isPublicEmailDomain(domain)
          ? this.createError({ message: t('account.verification.domain.errors.publicDomain') })
          : true;
      }),
    email: yup
      .string()
      .defined()
      .test('email', function (value) {
        const email = normalizeEmail(value);
        if (!email) {
          return this.createError({ message: t('account.verification.domain.errors.emailRequired') });
        }
        if (!yup.string().email().isValidSync(email) || email.length > VERIFICATION_FIELD_MAX_LENGTH) {
          return this.createError({ message: t('account.verification.domain.errors.emailInvalid') });
        }
        // Cross-field: only judged once the domain itself is valid, so one mistake shows one error.
        const domain = normalizeDomain((this.parent as DomainEmailFormValues).domain);
        if (!isValidDomain(domain)) return true;
        return email.endsWith(`@${domain}`)
          ? true
          : this.createError({ message: t('account.verification.domain.errors.emailMismatch', { domain }) });
      }),
  });

export const toStartDomainVerificationRequest = ({
  domain,
  email,
}: DomainEmailFormValues): StartDomainVerificationRequest => ({
  domain: normalizeDomain(domain),
  email: normalizeEmail(email),
});
