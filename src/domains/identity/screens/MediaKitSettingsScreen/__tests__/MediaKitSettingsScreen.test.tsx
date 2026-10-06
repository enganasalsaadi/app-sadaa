import React from 'react';
import { act, create } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import type { MediaKitSettingsScreenModel } from '../hooks/useMediaKitSettingsScreen';
import { MediaKitSettingsScreen } from '../MediaKitSettingsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/core/theme', () => {
  const tokens: object = new Proxy({}, { get: () => tokens });
  return { useTheme: () => ({ colors: tokens, sizes: tokens, isRTL: false }) };
});

jest.mock('@/shared/context/BottomBarContext', () => ({ useHideBottomBar: jest.fn() }));

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

jest.mock('../../../utils/mediaKitSlug', () => ({ SLUG_MAX_LENGTH: 30 }));

jest.mock('../../../components/DiscardChangesSheet', () => ({ DiscardChangesSheet: () => null }));

// Renders the slug field straight from the model, so no form library runs in the test.
jest.mock('react-hook-form', () => ({
  Controller: ({
    render,
  }: {
    render: (args: object) => React.ReactElement;
  }) =>
    render({
      field: { ref: jest.fn(), value: 'noor', onChange: mockOnChange, onBlur: jest.fn() },
      fieldState: { error: mockFieldError.current },
    }),
}));
const mockOnChange = jest.fn();
const mockFieldError: { current: { message: string } | undefined } = { current: undefined };

jest.mock('@/shared/ui', () => {
  const { createElement, Fragment } = jest.requireActual<typeof React>('react');
  const stub = (host: string) => {
    const Component = ({ children, ...props }: { children?: React.ReactNode }) =>
      createElement(host, props, children);
    Component.displayName = host;
    return Component;
  };
  const Layout = ({
    footer,
    children,
    ...props
  }: {
    footer?: React.ReactNode;
    children?: React.ReactNode;
  }) => createElement('Layout', props, createElement(Fragment, null, children, footer));
  const ListRow = ({ trailing, ...props }: { trailing?: React.ReactNode }) =>
    createElement('ListRow', props, trailing);
  return {
    Box: stub('Box'),
    ConfirmSheet: stub('ConfirmSheet'),
    CustomInput: stub('CustomInput'),
    ErrorState: stub('ErrorState'),
    FormSection: stub('FormSection'),
    Layout,
    LayoutFooter: stub('LayoutFooter'),
    ListGroup: stub('ListGroup'),
    ListRow,
    Notice: stub('Notice'),
    Skeleton: stub('Skeleton'),
    Switch: stub('Switch'),
  };
});

const mockModel: { current: MediaKitSettingsScreenModel | null } = { current: null };
jest.mock('../hooks/useMediaKitSettingsScreen', () => ({
  useMediaKitSettingsScreen: () => mockModel.current,
}));

const isHost = (type: string) => (node: ReactTestInstance) => node.type === type;

const model = (
  overrides: Partial<MediaKitSettingsScreenModel> = {},
): MediaKitSettingsScreenModel =>
  ({
    status: 'ready',
    loadError: undefined,
    onRetry: jest.fn(),
    control: {},
    normalizeSlug: (text: string) => text.toLowerCase(),
    slugFeedback: { hint: 'available', hintTone: 'success' },
    cooldownMessage: null,
    onSave: jest.fn(),
    isSaving: false,
    isPublic: true,
    isUpdatingVisibility: false,
    onTogglePublic: jest.fn(),
    hideSheetVisible: false,
    confirmHide: jest.fn(),
    closeHideSheet: jest.fn(),
    guard: { visible: false, stay: jest.fn(), discard: jest.fn() },
    ...overrides,
  }) as MediaKitSettingsScreenModel;

const render = (overrides: Partial<MediaKitSettingsScreenModel> = {}) => {
  const vm = model(overrides);
  mockModel.current = vm;
  let tree: ReturnType<typeof create> | undefined;
  act(() => {
    tree = create(<MediaKitSettingsScreen />);
  });
  if (!tree) throw new Error('render failed');
  return { root: tree.root, vm };
};

describe('MediaKitSettingsScreen', () => {
  beforeEach(() => {
    mockFieldError.current = undefined;
    mockOnChange.mockClear();
  });

  it('shows the live check result under the field and normalises typing', () => {
    const { root } = render();
    const input = root.find(isHost('CustomInput'));
    expect(input.props.hint).toBe('available');
    expect(input.props.hintTone).toBe('success');
    expect(input.props.error).toBeUndefined();
    act(() => input.props.onChangeText('Noor.Style'));
    expect(mockOnChange).toHaveBeenCalledWith('noor.style');
  });

  it('a form error wins over the live result', () => {
    mockFieldError.current = { message: 'cooldown until' };
    const { root } = render({ slugFeedback: { error: 'taken', hintTone: 'neutral' } });
    expect(root.find(isHost('CustomInput')).props.error).toBe('cooldown until');
  });

  it('shows a taken result as an error', () => {
    const { root } = render({ slugFeedback: { error: 'taken', hintTone: 'neutral' } });
    expect(root.find(isHost('CustomInput')).props.error).toBe('taken');
  });

  it('keeps the field editable during the cooldown and explains it', () => {
    const { root } = render({ cooldownMessage: 'You can pick a new link on 5 November' });
    const notice = root.find(isHost('Notice'));
    expect(notice.props.message).toBe('You can pick a new link on 5 November');
    expect(root.find(isHost('CustomInput')).props.editable).toBe(true);
  });

  it('wires save as the one primary', () => {
    const { root, vm } = render({ isSaving: true });
    const footer = root.find(isHost('LayoutFooter'));
    expect(footer.props.primary.onPress).toBe(vm.onSave);
    expect(footer.props.primary.loading).toBe(true);
    expect(root.find(isHost('CustomInput')).props.editable).toBe(false);
  });

  it('wires the visibility switch and the hide confirmation', () => {
    const { root, vm } = render({ isPublic: false, isUpdatingVisibility: true, hideSheetVisible: true });
    const toggle = root.find(isHost('Switch'));
    expect(toggle.props.value).toBe(false);
    expect(toggle.props.disabled).toBe(true);
    expect(toggle.props.onValueChange).toBe(vm.onTogglePublic);
    expect(root.find(isHost('ListGroup')).props.footer).toBe(
      'account.mediaKit.settingsScreen.visibility.offHint',
    );
    const sheet = root.find(isHost('ConfirmSheet'));
    expect(sheet.props.visible).toBe(true);
    expect(sheet.props.onConfirm).toBe(vm.confirmHide);
  });

  it('loading: skeleton, no footer; error: retry', () => {
    const loading = render({ status: 'loading' });
    expect(loading.root.findAll(isHost('CustomInput'))).toHaveLength(0);
    expect(loading.root.findAll(isHost('LayoutFooter'))).toHaveLength(0);
    expect(loading.root.findAll(isHost('Skeleton')).length).toBeGreaterThan(0);

    const failed = render({ status: 'error' });
    expect(failed.root.find(isHost('ErrorState')).props.onRetry).toBe(failed.vm.onRetry);
  });
});
