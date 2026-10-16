import { isOnTabRoot } from '../tabRoot';

/** A tab route whose nested stack shows `names` (last one focused). */
const tabShowing = (...names: string[]) => ({
  key: 'tab',
  name: 'Tab',
  state: { index: names.length - 1, routes: names.map(name => ({ key: name, name })) },
});

describe('isOnTabRoot', () => {
  it('is true before the tab stack mounts and for a tab without a stack', () => {
    expect(isOnTabRoot({ key: 'messages', name: 'MessagesTab' })).toBe(true);
  });

  it('is true on each main screen', () => {
    for (const name of ['BrandHomeScreen', 'CreatorHomeScreen', 'Deals', 'WalletScreen', 'ProfileScreen']) {
      expect(isOnTabRoot(tabShowing(name))).toBe(true);
    }
  });

  it('is false once a screen is pushed over the main one', () => {
    expect(isOnTabRoot(tabShowing('Deals', 'DealDetail'))).toBe(false);
    expect(isOnTabRoot(tabShowing('WalletScreen', 'Withdraw'))).toBe(false);
  });

  it('is false when a deep link opens the stack straight on an inner screen', () => {
    expect(isOnTabRoot(tabShowing('DealDetail'))).toBe(false);
    expect(isOnTabRoot({ key: 'wallet', name: 'WalletTab', params: { screen: 'PayoutMethods' } })).toBe(false);
  });
});
