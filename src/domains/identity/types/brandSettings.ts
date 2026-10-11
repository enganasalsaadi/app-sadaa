/** `GET`/`PATCH /brand/settings` (contract §8.3). */
export interface BrandSettings {
  /** `false` keeps this brand out of every creator's "worked with" list. Default `true`. */
  show_on_creator_profiles: boolean;
}
