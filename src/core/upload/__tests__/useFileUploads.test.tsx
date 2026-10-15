import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useFileUploads, type FileUploads } from '../useFileUploads';
import { UploadError } from '../uploadError';
import type { UploadFileOptions } from '../uploadFile';
import type { UploadPolicy, UploadSource } from '../uploadTypes';

interface Call {
  options: UploadFileOptions;
  resolve(fileId: string): void;
  reject(error: unknown): void;
}
const mockCalls: Call[] = [];
jest.mock('../uploadFile', () => ({
  uploadFile: (options: UploadFileOptions) =>
    new Promise<string>((resolve, reject) => {
      mockCalls.push({ options, resolve, reject });
    }),
}));

const policy: UploadPolicy = { rules: [{ mimes: ['image/jpeg'], maxBytes: 100 }] };
const requestSlot = jest.fn();
const file = (name: string): UploadSource => ({ uri: `file:///${name}`, name, mime: 'image/jpeg', size: 10 });

const vm: { current: FileUploads | null } = { current: null };
const Probe: React.FC<{ limit?: number; slotPolicy?: UploadPolicy }> = ({ limit, slotPolicy = policy }) => {
  vm.current = useFileUploads({ policy: slotPolicy, requestSlot, limit });
  return null;
};
const current = () => {
  if (!vm.current) throw new Error('not rendered');
  return vm.current;
};
const call = (index: number) => {
  const found = mockCalls[index];
  if (!found) throw new Error(`no upload #${index}`);
  return found;
};

let renderer: ReactTestRenderer;
const mount = (limit?: number) => {
  act(() => {
    renderer = create(<Probe limit={limit} />);
  });
};
const settle = async (fn: () => void) => {
  await act(async () => {
    fn();
    await Promise.resolve();
  });
};

beforeEach(() => {
  mockCalls.length = 0;
  vm.current = null;
});

it('uploads each added file, tracks progress and collects file ids in pick order', async () => {
  mount();
  act(() => {
    current().add([file('a.jpg'), file('b.jpg')]);
  });
  expect(current().entries.map(e => e.status)).toEqual(['uploading', 'uploading']);
  expect(current().isUploading).toBe(true);
  expect(call(0).options.policy).toBe(policy);
  expect(call(0).options.requestSlot).toBe(requestSlot);

  act(() => call(0).options.onProgress?.(0.4));
  expect(current().entries[0]?.progress).toBe(0.4);

  await settle(() => call(1).resolve('id-b'));
  await settle(() => call(0).resolve('id-a'));
  expect(current().fileIds).toEqual(['id-a', 'id-b']);
  expect(current().isUploading).toBe(false);
  expect(current().entries[0]).toMatchObject({ status: 'done', progress: 1, fileId: 'id-a' });
});

it('drops picks beyond the limit and reports how many', () => {
  mount(2);
  let dropped = 0;
  act(() => {
    dropped = current().add([file('a.jpg')]);
  });
  expect(dropped).toBe(0);
  act(() => {
    dropped = current().add([file('b.jpg'), file('c.jpg'), file('d.jpg')]);
  });
  expect(dropped).toBe(2);
  expect(current().entries).toHaveLength(2);
  expect(current().remaining).toBe(0);
  expect(mockCalls).toHaveLength(2);
});

it('frees a place under the limit when a file is removed', () => {
  mount(1);
  act(() => {
    current().add([file('a.jpg')]);
  });
  const key = current().entries[0]?.key ?? '';
  act(() => current().remove(key));
  expect(current().remaining).toBe(1);
  let dropped = -1;
  act(() => {
    dropped = current().add([file('b.jpg')]);
  });
  expect(dropped).toBe(0);
});

it('moves a file to another place and submits ids in the new order', async () => {
  mount();
  act(() => {
    current().add([file('a.jpg'), file('b.jpg'), file('c.jpg')]);
  });
  await settle(() => {
    call(0).resolve('id-a');
    call(1).resolve('id-b');
    call(2).resolve('id-c');
  });
  const keyOf = (index: number) => current().entries[index]?.key ?? '';
  act(() => current().move(keyOf(2), 0));
  expect(current().fileIds).toEqual(['id-c', 'id-a', 'id-b']);
  act(() => current().move(keyOf(0), 9));
  expect(current().fileIds).toEqual(['id-a', 'id-b', 'id-c']);
  act(() => current().move('missing', 0));
  expect(current().fileIds).toEqual(['id-a', 'id-b', 'id-c']);
});

it('marks a failure with its reason and cause, and retries with a fresh upload', async () => {
  mount();
  act(() => {
    current().add([file('a.jpg')]);
  });
  const apiError = { status: 409 };
  await settle(() => call(0).reject(new UploadError('slot', { cause: apiError })));
  expect(current().entries[0]).toMatchObject({ status: 'failed', failure: 'slot', cause: apiError });
  expect(current().hasFailed).toBe(true);

  const key = current().entries[0]?.key ?? '';
  act(() => current().retry(key));
  expect(mockCalls).toHaveLength(2);
  expect(current().entries[0]).toMatchObject({ status: 'uploading', failure: null, cause: null });

  await settle(() => call(1).resolve('id-a'));
  expect(current().fileIds).toEqual(['id-a']);
});

it('keeps the cap on a size rejection', async () => {
  mount();
  act(() => {
    current().add([file('a.jpg')]);
  });
  await settle(() => call(0).reject(new UploadError('size', { maxBytes: 100 })));
  expect(current().entries[0]).toMatchObject({ failure: 'size', maxBytes: 100 });
});

it('ignores retry while the upload is still running', () => {
  mount();
  act(() => {
    current().add([file('a.jpg')]);
  });
  const key = current().entries[0]?.key ?? '';
  act(() => current().retry(key));
  expect(mockCalls).toHaveLength(1);
});

it('remove aborts the in-flight upload and ignores its late result', async () => {
  mount();
  act(() => {
    current().add([file('a.jpg')]);
  });
  const key = current().entries[0]?.key ?? '';
  act(() => current().remove(key));
  expect(call(0).options.signal?.aborted).toBe(true);
  await settle(() => call(0).resolve('late'));
  expect(current().entries).toEqual([]);
  expect(current().fileIds).toEqual([]);
});

it('clear aborts everything', () => {
  mount();
  act(() => {
    current().add([file('a.jpg'), file('b.jpg')]);
  });
  act(() => current().clear());
  expect(mockCalls.every(c => c.options.signal?.aborted)).toBe(true);
  expect(current().entries).toEqual([]);
});

it('aborts in-flight uploads on unmount', () => {
  mount();
  act(() => {
    current().add([file('a.jpg'), file('b.jpg')]);
  });
  act(() => renderer.unmount());
  expect(mockCalls.every(c => c.options.signal?.aborted)).toBe(true);
});

it('uses the latest config without restarting running uploads', () => {
  mount();
  act(() => {
    current().add([file('a.jpg')]);
  });
  const next: UploadPolicy = { rules: [{ mimes: ['image/png'], maxBytes: 5 }] };
  act(() => {
    renderer.update(<Probe slotPolicy={next} />);
  });
  expect(call(0).options.signal?.aborted).toBe(false);
  act(() => {
    current().add([file('b.png')]);
  });
  expect(call(1).options.policy).toBe(next);
});
