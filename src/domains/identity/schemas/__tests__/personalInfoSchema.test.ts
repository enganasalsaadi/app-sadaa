import type { TFunction } from 'i18next';
import { BIO_MAX_LENGTH } from '../../utils/bioRules';
import { createPersonalInfoSchema, type PersonalInfoFormValues } from '../personalInfoSchema';

const t = ((key: string) => key) as unknown as TFunction;
const schema = createPersonalInfoSchema(t);

const valid: PersonalInfoFormValues = {
  fullName: 'Rama',
  email: '',
  governorate: 'damascus',
  gender: '',
  area: '',
  bio: '',
};

const bioError = async (bio: string): Promise<string | undefined> => {
  try {
    await schema.validate({ ...valid, bio });
    return undefined;
  } catch (err) {
    return (err as Error).message;
  }
};

describe('personalInfoSchema bio', () => {
  it('is optional', async () => {
    expect(await bioError('')).toBeUndefined();
  });

  it('accepts exactly the limit and rejects one more', async () => {
    expect(await bioError('a'.repeat(BIO_MAX_LENGTH))).toBeUndefined();
    expect(await bioError('a'.repeat(BIO_MAX_LENGTH + 1))).toBe('validation.maxLength');
  });

  it('rejects contact details with the bio message', async () => {
    expect(await bioError('call 0944 123 456')).toBe('validation.bioContact');
    expect(await bioError('write to rama@food.sy')).toBe('validation.bioContact');
  });

  it('accepts a clean bio', async () => {
    expect(await bioError('صانعة محتوى طعام من دمشق')).toBeUndefined();
  });
});

describe('personalInfoSchema gender', () => {
  it('accepts not told, male and female', async () => {
    for (const gender of ['', 'male', 'female'] as const) {
      await expect(schema.validate({ ...valid, gender })).resolves.toBeTruthy();
    }
  });

  it('rejects anything else', async () => {
    await expect(schema.validate({ ...valid, gender: 'other' })).rejects.toBeTruthy();
  });
});
