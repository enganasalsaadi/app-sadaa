import { Linking } from 'react-native';
import { AppLinkManager } from '../AppLinkManager';

const HOST = 'links.sada.app';

describe('AppLinkManager', () => {
  let now = 0;
  const create = () => new AppLinkManager(HOST, () => now);

  beforeEach(() => {
    now = 1_000;
    jest.restoreAllMocks();
  });

  it('delivers a valid link straight to the registered handler', () => {
    const manager = create();
    const handler = jest.fn();
    manager.registerOpenHandler(handler);
    manager.open('https://links.sada.app/c/anas');
    expect(handler).toHaveBeenCalledWith({ kind: 'creator', slug: 'anas' });
  });

  it('drops invalid links', () => {
    const manager = create();
    const handler = jest.fn();
    manager.registerOpenHandler(handler);
    manager.open('https://evil.com/c/anas');
    manager.open(null);
    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps a link for a late handler for 30 s, then once only', () => {
    const manager = create();
    manager.open('sada://c/anas');
    now += 29_000;
    const handler = jest.fn();
    const unsubscribe = manager.registerOpenHandler(handler);
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    const next = jest.fn();
    manager.registerOpenHandler(next);
    expect(next).not.toHaveBeenCalled();
  });

  it('drops a pending link older than 30 s', () => {
    const manager = create();
    manager.open('sada://c/anas');
    now += 30_000;
    const handler = jest.fn();
    manager.registerOpenHandler(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('buffers again once the handler unsubscribes', () => {
    const manager = create();
    const handler = jest.fn();
    const unsubscribe = manager.registerOpenHandler(handler);
    unsubscribe();
    manager.open('sada://c/anas');
    expect(handler).not.toHaveBeenCalled();
    const next = jest.fn();
    manager.registerOpenHandler(next);
    expect(next).toHaveBeenCalledWith({ kind: 'creator', slug: 'anas' });
  });

  it('start() reads the launch URL and listens for later ones, once', async () => {
    const remove = jest.fn();
    let listener: ((event: { url: string }) => void) | undefined;
    const addEventListener = jest
      .spyOn(Linking, 'addEventListener')
      .mockImplementation((_type, handler) => {
        listener = handler as (event: { url: string }) => void;
        return { remove } as unknown as ReturnType<typeof Linking.addEventListener>;
      });
    const getInitialURL = jest
      .spyOn(Linking, 'getInitialURL')
      .mockResolvedValue('https://links.sada.app/c/launch');

    const manager = create();
    const handler = jest.fn();
    manager.registerOpenHandler(handler);
    manager.start();
    manager.start();
    await Promise.resolve();

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(getInitialURL).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ kind: 'creator', slug: 'launch' });

    listener?.({ url: 'sada://c/later' });
    expect(handler).toHaveBeenLastCalledWith({ kind: 'creator', slug: 'later' });
  });
});
