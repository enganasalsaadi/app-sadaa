import {
  CommonActions,
  StackActions,
  createNavigationContainerRef,
  type ParamListBase,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export const navigate = (
  screen: string,
  params?: Record<string, unknown>,
): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: screen,
        params,
      }),
    );
  }
};

export const replace = (
  screen: string,
  params?: Record<string, unknown>,
): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen, params }],
      }),
    );
  }
};

export const push = (
  screen: string,
  params?: Record<string, unknown>,
): void => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(screen, params));
  }
};

export const goBack = (): void => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};
