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

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  errors?: unknown[];
  pagination?: PaginatedMeta;
  meta?: { pagination?: PaginationMeta };
}

export type ApiUnknownRecord = Record<string, unknown>;

export type LoadPhase = 'idle' | 'initial' | 'refreshing' | 'more';
