import Config from 'react-native-config';

export type AppEnv = 'development' | 'staging' | 'production';

interface EnvConfig {
  APP_ENV: AppEnv;
  API_BASE_URL: string;
  API_VERSION: string;

  SENTRY_DSN: string;
  ANALYTICS_KEY: string;

  ENABLE_LOGS: boolean;
  ENABLE_MOCK_DATA: boolean;

  /** Numeric App Store id for the force-update link; empty until the app is published. */
  IOS_APP_STORE_ID: string;
}

const trimSlashes = (
  value: string,
  mode: 'start' | 'end' | 'both' = 'both',
): string => {
  if (mode === 'start') {
    return value.replace(/^\/+/, '');
  }

  if (mode === 'end') {
    return value.replace(/\/+$/, '');
  }

  return value.replace(/^\/+|\/+$/g, '');
};

const joinUrl = (...parts: string[]): string => {
  const filtered = parts
    .map((part, index) =>
      index === 0 ? trimSlashes(part, 'end') : trimSlashes(part, 'both'),
    )
    .filter(Boolean);

  return filtered.join('/');
};

const getStringValue = (key: string, fallback: string = ''): string => {
  return Config[key] ?? fallback;
};

const getBooleanValue = (key: string, fallback: boolean = false): boolean => {
  const value = Config[key];
  if (value === undefined) {
    return fallback;
  }
  return value === 'true' || value === '1';
};

export const env: EnvConfig = {
  APP_ENV: getStringValue('APP_ENV', 'production') as AppEnv,
  API_BASE_URL: getStringValue('API_BASE_URL', 'https://sanadk.ai/api'),
  API_VERSION: getStringValue('API_VERSION', 'v1'),

  SENTRY_DSN: getStringValue('SENTRY_DSN'),
  ANALYTICS_KEY: getStringValue('ANALYTICS_KEY'),

  ENABLE_LOGS: getBooleanValue('ENABLE_LOGS', true),
  ENABLE_MOCK_DATA: getBooleanValue('ENABLE_MOCK_DATA', false),

  IOS_APP_STORE_ID: getStringValue('IOS_APP_STORE_ID'),
};

export const isDev = env.APP_ENV === 'development';
export const isStaging = env.APP_ENV === 'staging';
export const isProd = env.APP_ENV === 'production';

export const apiUrl = joinUrl(env.API_BASE_URL, env.API_VERSION);
