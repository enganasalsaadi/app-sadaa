interface TwoWaysInput {
  /** `useCampaignsEnabled('brand')`: `null` while the flag is unknown. */
  campaignsEnabled: boolean | null;
  /** Home has loaded and carries no open deal. */
  noOpenDeal: boolean;
  /** Home carries no active campaign. */
  noActiveCampaign: boolean;
}

/**
 * The «two ways» card teaches a brand that has not worked with a creator yet: it shows only
 * while campaigns are on (else there is nothing to compare) and nothing is open — it leaves by
 * itself once the first deal or campaign is.
 */
export const shouldShowTwoWays = ({ campaignsEnabled, noOpenDeal, noActiveCampaign }: TwoWaysInput): boolean =>
  campaignsEnabled === true && noOpenDeal && noActiveCampaign;
