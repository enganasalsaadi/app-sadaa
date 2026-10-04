import type { KycStatus } from '@/domains/auth';

/** `GET /user/kyc` and the `POST /user/kyc` 201 body (contract §7.3–7.4). */
export interface KycDetails {
  status: KycStatus;
  document_type: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  /** True while status is `unverified` or `rejected`. */
  can_submit: boolean;
}
