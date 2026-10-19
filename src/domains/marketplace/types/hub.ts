/** The two faces of the brand's deals tab: public campaigns, and requests sent straight to a creator. */
export type HubFace = 'campaigns' | 'deals';

/** One chip of a face's filter row. */
export interface HubFilterOption<T extends string> {
  value: T;
  label: string;
  /** How many items it holds (0 = nothing shown). */
  count: number;
  /** Something inside waits on the brand. */
  attention: boolean;
}
