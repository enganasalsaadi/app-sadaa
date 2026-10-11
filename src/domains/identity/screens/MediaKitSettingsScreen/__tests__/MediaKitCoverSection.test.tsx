import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { MediaKitCoverModel } from '../../../hooks/useMediaKitCover';
import { MediaKitCoverSection } from '../components/MediaKitCoverSection';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
});

jest.mock('lucide-react-native', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        typeof name === 'string' && name !== '__esModule'
          ? (props: object) => createElement('Icon', { name, ...props })
          : undefined,
    },
  );
});

jest.mock('../components/MediaKitCoverFrame', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  return {
    MediaKitCoverFrame: ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement('Frame', props, children),
  };
});

jest.mock('@/shared/ui', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  return {
    Box: stub('Box'),
    ConfirmSheet: stub('ConfirmSheet'),
    CustomButton: stub('CustomButton'),
    FormSection: stub('FormSection'),
    Image: stub('Image'),
    Text: stub('Text'),
  };
});

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const model = (overrides: Partial<MediaKitCoverModel> = {}): MediaKitCoverModel => ({
  previewUri: null,
  hasCover: false,
  isPending: false,
  isUploading: false,
  isRemoving: false,
  onChoose: jest.fn(),
  onCancelPending: jest.fn(),
  onUpload: jest.fn(),
  removeSheetVisible: false,
  openRemoveSheet: jest.fn(),
  closeRemoveSheet: jest.fn(),
  confirmRemove: jest.fn(),
  ...overrides,
});

const render = (overrides: Partial<MediaKitCoverModel> = {}) => {
  const cover = model(overrides);
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitCoverSection cover={cover} />);
  });
  if (!tree) throw new Error('render failed');
  const titles = () => tree?.root.findAll(isHost('CustomButton')).map(b => b.props.title);
  return { root: tree.root, cover, titles };
};

describe('MediaKitCoverSection', () => {
  it('no cover: empty tile, only "choose"', () => {
    const { root, cover, titles } = render();
    expect(root.findAll(isHost('Image'))).toHaveLength(0);
    expect(titles()).toEqual(['account.mediaKit.settingsScreen.cover.choose']);
    root.find(isHost('CustomButton')).props.onPress();
    expect(cover.onChoose).toHaveBeenCalled();
  });

  it('saved cover: shows it, offers change and remove', () => {
    const { root, cover, titles } = render({ previewUri: 'https://cdn/c.webp', hasCover: true });
    expect(root.find(isHost('Image')).props.uri).toBe('https://cdn/c.webp');
    expect(titles()).toEqual([
      'account.mediaKit.settingsScreen.cover.change',
      'account.mediaKit.settingsScreen.cover.remove',
    ]);
    const remove = root.findAll(isHost('CustomButton'))[1];
    act(() => remove?.props.onPress());
    expect(cover.openRemoveSheet).toHaveBeenCalled();
  });

  it('picked photo: previews it and asks to confirm before anything uploads', () => {
    const { root, cover, titles } = render({
      previewUri: 'file:///picked.jpg',
      hasCover: true,
      isPending: true,
      isUploading: true,
    });
    expect(root.find(isHost('Image')).props.uri).toBe('file:///picked.jpg');
    expect(titles()).toEqual(['common.cancel', 'account.mediaKit.settingsScreen.cover.use']);
    const [cancel, use] = root.findAll(isHost('CustomButton'));
    expect(cancel?.props.disabled).toBe(true);
    expect(use?.props.loading).toBe(true);
    act(() => use?.props.onPress());
    expect(cover.onUpload).toHaveBeenCalled();
  });

  it('wires the remove confirmation sheet', () => {
    const { root, cover } = render({ hasCover: true, removeSheetVisible: true });
    const sheet = root.find(isHost('ConfirmSheet'));
    expect(sheet.props.visible).toBe(true);
    expect(sheet.props.onConfirm).toBe(cover.confirmRemove);
    expect(sheet.props.onClose).toBe(cover.closeRemoveSheet);
  });

  it('blocks choosing while a remove is in flight', () => {
    const { root } = render({ hasCover: true, isRemoving: true });
    expect(root.findAll(isHost('CustomButton'))[0]?.props.disabled).toBe(true);
    expect(root.findAll(isHost('CustomButton'))[1]?.props.loading).toBe(true);
  });
});
