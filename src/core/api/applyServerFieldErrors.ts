/**
 * 422 envelope: `{ message, errors: { phone: ['...'], company_name: ['...'] } }`.
 * Maps each server field's first message onto the matching form field so the
 * error shows under the input instead of as a generic banner.
 *
 * Returns true when at least one field error was applied — callers then skip
 * the generic InlineError for that response.
 */
export const extractServerFieldErrors = (
  error: unknown,
): Record<string, string> | null => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return null;
  }
  const { data } = error as { data?: unknown };
  if (typeof data !== 'object' || data === null || !('errors' in data)) {
    return null;
  }
  const { errors } = data as { errors?: unknown };
  if (typeof errors !== 'object' || errors === null || Array.isArray(errors)) {
    return null;
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string' && first.trim()) {
      result[key] = first;
    }
  }
  return Object.keys(result).length > 0 ? result : null;
};

export const applyServerFieldErrors = <TField extends string>(
  error: unknown,
  fieldMap: Readonly<Record<string, TField>>,
  setError: (field: TField, error: { type: 'server'; message: string }) => void,
): boolean => {
  const fieldErrors = extractServerFieldErrors(error);
  if (!fieldErrors) return false;

  let applied = false;
  for (const [serverKey, message] of Object.entries(fieldErrors)) {
    const field = fieldMap[serverKey];
    if (field) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  }
  return applied;
};
