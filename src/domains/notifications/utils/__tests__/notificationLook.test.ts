import { Bell, Handshake, Megaphone, Truck } from 'lucide-react-native';
import { notificationLook } from '../notificationLook';

// Lucide icons are only compared by identity.
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_t, name) => String(name) }));

describe('notificationLook', () => {
  it('uses the entry of a known type', () => {
    expect(notificationLook('deal_return_required')).toEqual({ icon: Truck, tone: 'warning' });
  });

  it('falls back to the family of a type this build has not seen', () => {
    expect(notificationLook('deal_draft_submitted')).toEqual({ icon: Handshake, tone: 'interactive' });
    expect(notificationLook('campaign_brand_new_kind')).toEqual({ icon: Megaphone, tone: 'interactive' });
  });

  it('falls back to the bell for anything else', () => {
    expect(notificationLook('test')).toEqual({ icon: Bell, tone: 'interactive' });
  });
});
