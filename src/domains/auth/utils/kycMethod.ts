import { KYC_METHODS, type KycMethod } from '../store/authTypes';

const isKycMethod = (value: string): value is KycMethod =>
  (KYC_METHODS as readonly string[]).includes(value);

/** `kyc.method` from `/me` or `/user/kyc`; a value this build doesn't know reads as no method. */
export const toKycMethod = (value: string | null | undefined): KycMethod | null =>
  value && isKycMethod(value) ? value : null;
