import type {
  ApplicantArgs,
  ApplicantDecision,
  ApplicantsArgs,
  ApplicantsCompareArgs,
  CampaignActionPath,
  CampaignListArgs,
  CreatorApplicationsArgs,
  CreatorFeedArgs,
} from '../types/campaign';

const BRAND_CAMPAIGNS = '/brand/campaigns';
const CREATOR_CAMPAIGNS = '/influencer/campaigns';
const CREATOR_APPLICATIONS = '/influencer/campaign-applications';

/** Array filters go out as `key[]=a&key[]=b` (fetchBaseQuery would join them with commas). */
const repeated = (key: string, values: readonly string[] = []) =>
  values.map(value => `${encodeURIComponent(`${key}[]`)}=${encodeURIComponent(value)}`);

const withPage = (base: string, filters: string[], page: number) =>
  `${base}?${[...filters, `page=${page}`].join('&')}`;

const subPathOf = (base: string, id: string, subPath?: string) => {
  const url = `${base}/${encodeURIComponent(id)}`;
  return subPath ? `${url}/${subPath.split('/').map(encodeURIComponent).join('/')}` : url;
};

/** `POST /brand/campaigns` creates a draft. */
export const BRAND_CAMPAIGNS_URL = BRAND_CAMPAIGNS;

/** `/brand/campaigns/{id}[/sub/path]`, every segment encoded. */
export const buildBrandCampaignUrl = (id: string, path?: CampaignActionPath | 'history' | 'quote' | 'drop' | 'shipping' | 'shipments') =>
  subPathOf(BRAND_CAMPAIGNS, id, path);

/** `/brand/campaigns/{id}/files[/{file}[/complete]]`: the upload slot, its confirmation, its removal. */
export const buildBrandCampaignFilesUrl = (id: string, fileId?: string, step?: 'complete') =>
  subPathOf(BRAND_CAMPAIGNS, id, ['files', fileId, step].filter(Boolean).join('/'));

export const buildBrandCampaignsUrl = ({ statuses }: CampaignListArgs, page: number) =>
  withPage(BRAND_CAMPAIGNS, repeated('status', statuses), page);

/** `/brand/campaigns/{id}/applications`: statuses and filters as repeated keys, `invited=1` only when on. */
export const buildBrandApplicantsUrl = (
  { id, statuses, governorates, niches, minFollowers, invitedOnly, sort }: ApplicantsArgs,
  page: number,
) =>
  withPage(
    subPathOf(BRAND_CAMPAIGNS, id, 'applications'),
    [
      ...repeated('status', statuses),
      ...repeated('governorate', governorates),
      ...repeated('niche', niches),
      ...(minFollowers ? [`min_followers=${minFollowers}`] : []),
      ...(invitedOnly ? ['invited=1'] : []),
      `sort=${sort}`,
    ],
    page,
  );

/** `/brand/campaigns/{id}/applications/compare?ids[]=a&ids[]=b`: the cards to set side by side. */
export const buildBrandApplicantsCompareUrl = ({ id, ids }: ApplicantsCompareArgs) =>
  `${subPathOf(BRAND_CAMPAIGNS, id, 'applications/compare')}?${repeated('ids', ids).join('&')}`;

/** `/brand/campaigns/{id}/applications/{app}[/shortlist|reject|select]`: one card, or a decision on it. */
export const buildBrandApplicantUrl = ({ id, applicationId }: ApplicantArgs, decision?: ApplicantDecision | 'select') =>
  subPathOf(BRAND_CAMPAIGNS, id, ['applications', applicationId, decision].filter(Boolean).join('/'));

export const buildCreatorFeedUrl = ({ activityTypes, pricingModel }: CreatorFeedArgs, page: number) =>
  withPage(
    CREATOR_CAMPAIGNS,
    [
      ...repeated('activity_type', activityTypes),
      ...(pricingModel ? [`pricing_model=${encodeURIComponent(pricingModel)}`] : []),
    ],
    page,
  );

export const buildCreatorSavedUrl = (page: number) => withPage(`${CREATOR_CAMPAIGNS}/saved`, [], page);

export const buildCreatorCampaignUrl = (id: string) => subPathOf(CREATOR_CAMPAIGNS, id);

/** `POST` saves, `DELETE` removes; both idempotent. */
export const buildCreatorBookmarkUrl = (id: string) => subPathOf(CREATOR_CAMPAIGNS, id, 'bookmark');

/** `POST /influencer/campaigns/{id}/apply`. */
export const buildCreatorApplyUrl = (id: string) => subPathOf(CREATOR_CAMPAIGNS, id, 'apply');

export const buildCreatorApplicationsUrl = ({ statuses }: CreatorApplicationsArgs, page: number) =>
  withPage(CREATOR_APPLICATIONS, repeated('status', statuses), page);

export const buildCreatorApplicationUrl = (id: string) => subPathOf(CREATOR_APPLICATIONS, id);

/** `POST /influencer/campaign-applications/{id}/withdraw`. */
export const buildCreatorWithdrawUrl = (id: string) => subPathOf(CREATOR_APPLICATIONS, id, 'withdraw');
