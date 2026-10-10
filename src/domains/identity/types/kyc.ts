import type { KycMethod, KycStatus } from '@/domains/auth';

/** `GET /user/kyc` and the `POST /user/kyc` 201 body (contract §7.3–7.4). */
export interface KycDetailsDto {
  status: KycStatus;
  document_type: string | null;
  /** Localized `document_type`, shown as-is. */
  document_type_label?: string | null;
  method?: string | null;
  method_label?: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  /** True while status is `unverified` or `rejected`. */
  can_submit: boolean;
}

export interface KycDetails extends Omit<KycDetailsDto, 'method' | 'method_label'> {
  /** Unknown server value → `null`. */
  method: KycMethod | null;
  method_label: string | null;
}
