import type { DealLabeledDto } from './dealDto';

export interface CreatorRestrictionDto {
  id: string;
  kind: DealLabeledDto;
  blocks_public_applications: boolean;
  blocks_direct_offers: boolean;
  deal_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
}

/** `GET /influencer/restrictions`: rows in `data`, the two verdicts in `meta`. */
export interface CreatorRestrictionsMetaDto {
  can_apply_public: boolean;
  can_accept_direct: boolean;
}
