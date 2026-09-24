declare module 'react-native-config' {
  export interface NativeConfig {
    APP_ENV?: string;
    API_BASE_URL?: string;
    API_VERSION?: string;
    SENTRY_DSN?: string;
    ANALYTICS_KEY?: string;
    ENABLE_LOGS?: string;
    ENABLE_MOCK_DATA?: string;
    [key: string]: string | undefined;
  }

  export const Config: NativeConfig;
  export default Config;
}
