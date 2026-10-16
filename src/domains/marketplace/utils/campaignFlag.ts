/**
 * Are Public Campaigns on? `false` as soon as a campaign call said `feature_disabled`; else what
 * the cached Home says (`null` = Home not loaded yet, unknown). Entry points show on `true` only.
 */
export const resolveCampaignsEnabled = (
  serverDisabled: boolean,
  homeEnabled: boolean | undefined,
): boolean | null => (serverDisabled ? false : (homeEnabled ?? null));
