import * as yup from 'yup';
import type { TFunction } from 'i18next';
import { SLUG_REASON_KEY, validateSlugLocally } from '../utils/mediaKitSlug';

export interface MediaKitSlugFormValues {
  slug: string;
}

/** Contract §17.2 shape rules; reserved / taken are answered by the live check and the server. */
export const createMediaKitSlugSchema = (
  t: TFunction,
): yup.ObjectSchema<MediaKitSlugFormValues> =>
  yup.object({
    slug: yup
      .string()
      .required(t(SLUG_REASON_KEY.invalid_length))
      .test('slug-shape', function check(value) {
        const reason = validateSlugLocally(value);
        return reason ? this.createError({ message: t(SLUG_REASON_KEY[reason]) }) : true;
      }),
  });
