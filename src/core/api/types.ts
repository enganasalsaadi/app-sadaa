export type PaginatedMeta = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type PaginatedData<T> = {
  items: T;
  pagination: PaginatedMeta;
};

/** Laravel-style pagination — returned under `meta.pagination`. */
export type PaginationMeta = {
  per_page: number;
  current_page: number;
  has_more: boolean;
  total: number;
  last_page: number;
};

export type Paginated<T> = {
  items: T;
  pagination: PaginationMeta;
};

/** Mirrors backend `app/Enums/ApiErrorCode.php` (mobile contract §1). */
export const API_ERROR_CODES = [
  'unauthenticated',
  'forbidden',
  'forbidden_user_type',
  'account_suspended',
  'phone_not_verified',
  'not_found',
  'onboarding_step_out_of_order',
  'kyc_already_pending',
  'kyc_already_verified',
  'platform_already_exists',
  'last_platform',
  'platform_not_eligible_for_primary',
  'social_lookup_unavailable',
  'validation_failed',
  'too_many_requests',
  'otp_cooldown',
  'server_error',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** 422 only: `{ "platforms.0.handle": ["…"] }`. `null` on every other error. */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiMeta {
  locale?: string;
  /** Seconds — set on 429 `too_many_requests` / `otp_cooldown`. */
  retry_after?: number;
  pagination?: PaginationMeta;
}

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  error_code?: string | null;
  errors?: ApiFieldErrors | null;
  pagination?: PaginatedMeta;
  meta?: ApiMeta;
}

export type ApiUnknownRecord = Record<string, unknown>;

export type LoadPhase = 'idle' | 'initial' | 'refreshing' | 'more';
