import type { TFunction } from 'i18next';
import { createCampaignAnnouncementSchema } from '../campaignAnnouncementSchema';

// The courier icons load with the shipping helpers; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as unknown as TFunction;
const schema = createCampaignAnnouncementSchema(t);
const check = (body: string, link = '') => schema.validate({ body, link });

describe('createCampaignAnnouncementSchema', () => {
  it('accepts a message with no link', async () => {
    await expect(check('وصلت الدفعة')).resolves.toEqual({ body: 'وصلت الدفعة', link: '' });
  });

  it('trims the body before counting it', async () => {
    await expect(check('  ab  ')).rejects.toThrow('validation.minLength');
  });

  it('requires a body', async () => {
    await expect(check('   ')).rejects.toThrow('validation.required');
  });

  it('caps the body at 1000 characters', async () => {
    await expect(check('a'.repeat(1000))).resolves.toBeDefined();
    await expect(check('a'.repeat(1001))).rejects.toThrow('validation.maxLength');
  });

  it('takes an https link only', async () => {
    await expect(check('hello there', 'https://example.com/brief')).resolves.toBeDefined();
    await expect(check('hello there', 'http://example.com')).rejects.toThrow('marketplace.campaign.announcements.linkError');
    await expect(check('hello there', 'ftp://example.com/brief')).rejects.toThrow('marketplace.campaign.announcements.linkError');
  });

  it('caps the link at 500 characters', async () => {
    await expect(check('hello there', `https://example.com/${'a'.repeat(500)}`)).rejects.toThrow('validation.maxLength');
  });
});
