import type { DealListArgs, DealRef, DealRole } from '../types/deal';

/** The server calls the creator side `influencer`. */
const ROLE_PREFIX = {
  brand: 'brand',
  creator: 'influencer',
} as const satisfies Record<DealRole, string>;

const dealsPath = (role: DealRole) => `/${ROLE_PREFIX[role]}/deals`;

/** `/{brand|influencer}/deals/{id}[/sub/path]`, every segment encoded. */
export const buildDealUrl = ({ role, id }: DealRef, subPath?: string): string => {
  const base = `${dealsPath(role)}/${encodeURIComponent(id)}`;
  return subPath ? `${base}/${subPath.split('/').map(encodeURIComponent).join('/')}` : base;
};

/** List page. Statuses go out as `status[]=a&status[]=b` (fetchBaseQuery would join them with commas). */
export const buildDealsListUrl = ({ role, statuses = [] }: DealListArgs, page: number): string => {
  const params = [
    ...statuses.map(status => `${encodeURIComponent('status[]')}=${encodeURIComponent(status)}`),
    `page=${page}`,
  ];
  return `${dealsPath(role)}?${params.join('&')}`;
};
