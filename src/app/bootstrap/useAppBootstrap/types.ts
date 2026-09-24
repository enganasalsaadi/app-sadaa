export enum AppStatus {
  LOADING = 'LOADING',
  CHOOSE_LANGUAGE = 'CHOOSE_LANGUAGE',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  AUTHENTICATED = 'AUTHENTICATED',
}

export interface BootstrapState {
  status: AppStatus;
  isReady: boolean;
}
