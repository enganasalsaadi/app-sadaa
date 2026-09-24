import type {SerializedError} from '@reduxjs/toolkit';
import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import type {ApiUnknownRecord} from './types';

export interface AppApiError {
  statusCode: number | null;
  message: string;
  code: string | null;
  details: string | ApiUnknownRecord | unknown[] | null;
  isValidationError: boolean;
  isUnauthorized: boolean;
  isForbidden: boolean;
  isServerError: boolean;
}

const FALLBACK_API_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const isRecord = (value: unknown): value is ApiUnknownRecord => {
  return typeof value === 'object' && value !== null;
};

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return isRecord(error) && 'status' in error;
};

const isSerializedError = (error: unknown): error is SerializedError => {
  return isRecord(error) && ('message' in error || 'code' in error);
};

const toSerializableDetails = (
  value: unknown,
): string | ApiUnknownRecord | unknown[] | null => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return value;
  }

  return String(value);
};

const getMessageFromErrorsArray = (errors: unknown[]): string | null => {
  for (const item of errors) {
    if (typeof item === 'string' && item.trim()) {
      return item;
    }

    if (isRecord(item)) {
      const nestedMessage = getMessageFromData(item);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return null;
};

const getMessageFromData = (data: unknown): string | null => {
  if (!data) {
    return null;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return getMessageFromErrorsArray(data);
  }

  if (!isRecord(data)) {
    return null;
  }

  const directMessageKeys = ['message', 'error', 'detail'];

  for (const key of directMessageKeys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  const errors = data.errors;
  if (Array.isArray(errors)) {
    const nestedErrorMessage = getMessageFromErrorsArray(errors);
    if (nestedErrorMessage) {
      return nestedErrorMessage;
    }
  }

  const nestedData = data.data;
  if (nestedData && nestedData !== data) {
    return getMessageFromData(nestedData);
  }

  return null;
};

const getStatusCode = (error: unknown): number | null => {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === 'number') {
      return error.status;
    }

    if (isRecord(error.data)) {
      const nestedStatus = error.data.status;
      if (typeof nestedStatus === 'number') {
        return nestedStatus;
      }

      if (isRecord(error.data.data) && typeof error.data.data.status === 'number') {
        return error.data.data.status;
      }
    }
  }

  if (isRecord(error)) {
    const nestedStatus = error.statusCode ?? error.status;
    if (typeof nestedStatus === 'number') {
      return nestedStatus;
    }
  }

  return null;
};

export const normalizeApiError = (error: unknown): AppApiError => {
  const statusCode = getStatusCode(error);

  if (isFetchBaseQueryError(error)) {
    const fallbackTransportMessage =
      'error' in error && typeof error.error === 'string'
        ? error.error
        : null;

    const message =
      getMessageFromData(error.data) ??
      fallbackTransportMessage ??
      FALLBACK_API_ERROR_MESSAGE;

    const code =
      typeof error.status === 'string'
        ? error.status
        : isRecord(error.data) && typeof error.data.code === 'string'
          ? error.data.code
          : null;

    return {
      statusCode,
      message,
      code,
      details: toSerializableDetails(
        error.data ?? fallbackTransportMessage ?? null,
      ),
      isValidationError: statusCode === 400 || statusCode === 422,
      isUnauthorized: statusCode === 401,
      isForbidden: statusCode === 403,
      isServerError: statusCode !== null && statusCode >= 500,
    };
  }

  if (isSerializedError(error)) {
    return {
      statusCode,
      message: error.message ?? FALLBACK_API_ERROR_MESSAGE,
      code: error.code ?? null,
      details: toSerializableDetails(error),
      isValidationError: statusCode === 400 || statusCode === 422,
      isUnauthorized: statusCode === 401,
      isForbidden: statusCode === 403,
      isServerError: statusCode !== null && statusCode >= 500,
    };
  }

  return {
    statusCode,
    message: FALLBACK_API_ERROR_MESSAGE,
    code: null,
    details: toSerializableDetails(error),
    isValidationError: statusCode === 400 || statusCode === 422,
    isUnauthorized: statusCode === 401,
    isForbidden: statusCode === 403,
    isServerError: statusCode !== null && statusCode >= 500,
  };
};

export const getApiErrorMessage = (error: unknown): string => {
  return normalizeApiError(error).message;
};
