import {
  applyServerFieldErrors,
  extractServerFieldErrors,
} from '../applyServerFieldErrors';

const serverError = (errors: unknown) => ({ status: 422, data: { errors } });

describe('extractServerFieldErrors', () => {
  it('takes the first message per field', () => {
    expect(
      extractServerFieldErrors(
        serverError({ phone: ['taken', 'other'], email: ['bad'] }),
      ),
    ).toEqual({ phone: 'taken', email: 'bad' });
  });

  it('accepts a plain string per field', () => {
    expect(extractServerFieldErrors(serverError({ phone: 'taken' }))).toEqual({
      phone: 'taken',
    });
  });

  it.each([
    [null],
    ['boom'],
    [{ status: 500 }],
    [{ data: { message: 'x' } }],
    [serverError(['a'])],
    [serverError({ phone: [] })],
  ])('returns null for %p', input => {
    expect(extractServerFieldErrors(input)).toBeNull();
  });
});

describe('applyServerFieldErrors', () => {
  it('maps server keys onto form fields', () => {
    const setError = jest.fn();
    const applied = applyServerFieldErrors(
      serverError({ company_name: ['required'], unknown: ['x'] }),
      { company_name: 'companyName' },
      setError,
    );
    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('companyName', {
      type: 'server',
      message: 'required',
    });
  });

  it('reports false when no key matches', () => {
    const setError = jest.fn();
    expect(
      applyServerFieldErrors(serverError({ other: ['x'] }), {}, setError),
    ).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
