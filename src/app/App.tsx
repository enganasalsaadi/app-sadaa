import '@/core/i18n';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';
import BootSplash from 'react-native-bootsplash';
import { toastConfig } from '@/shared/ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/core/theme';
import { FONT_FAMILY } from '@/core/theme/tokens/typography';
import { store, persistor } from '@/app/store';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { navigationRef, navigate } from '@/core/navigation';
import { useAppBootstrap, useSlowBoot } from '@/app/bootstrap';
import { useNetworkMonitor } from '@/core/hooks';
import { useNotification } from '@/core/hooks';
import { useFcmNotificationToken } from '@/domains/auth';
import { useGetProfileQuery } from '@/domains/auth';
import { useAppSelector } from '@/core/store';
import { selectIsAuthenticated } from '@/domains/auth';
import { GlobalErrorModal } from '@/shared/ui/GlobalErrorModal';
import { NetworkSnackbar } from '@/shared/ui/NetworkSnackbar';
import { BootScreen } from '@/app/screens/BootScreen';
import { setTestConfig } from '@/shared/utils/textReplacer';
const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();
  const { isReady, status, config: appConfig } = useAppBootstrap();
  const isSlowBoot = useSlowBoot(isReady);
  const { initialize, setNavigate } = useNotification();
  const { registerToken } = useFcmNotificationToken();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  useNetworkMonitor();
  useGetProfileQuery(undefined, { skip: !isAuthenticated });

  // Native splash covers the whole boot pipeline; on a slow boot BootScreen takes over.
  useEffect(() => {
    if (isReady || isSlowBoot) {
      BootSplash.hide({ fade: true });
    }
  }, [isReady, isSlowBoot]);

  useEffect(() => {
    if (appConfig) {
      setTestConfig(appConfig.test_mode ?? false, appConfig.test_replacements ?? []);
    }
  }, [appConfig]);

  useEffect(() => {
    setNavigate(navigate);
    initialize({ requestPermissionOnInit: false })
      .then(() => registerToken())
      .catch(() => undefined);
  }, [initialize, setNavigate, registerToken]);

  if (!isReady) {
    return isSlowBoot ? <BootScreen /> : null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: isDark,
        colors: {
          primary: colors.interactive.main,
          background: colors.layout.base,
          card: colors.navigation.tabBar.background,
          text: colors.text.primary,
          border: colors.border.default,
          notification: colors.status.danger.main,
        },
        fonts: {
          regular: { fontFamily: FONT_FAMILY.regular, fontWeight: 'normal' },
          medium: { fontFamily: FONT_FAMILY.medium, fontWeight: 'normal' },
          bold: { fontFamily: FONT_FAMILY.bold, fontWeight: 'normal' },
          heavy: { fontFamily: FONT_FAMILY.extraBold, fontWeight: 'normal' },
        },
      }}
    >
      <RootNavigator
        appStatus={status}
        maintenanceMessage={appConfig?.maintenance_message}
      />
      <GlobalErrorModal />
      <NetworkSnackbar />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ReduxProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ThemeProvider>
                <AppContent />
                <Toast config={toastConfig} />
              </ThemeProvider>
            </PersistGate>
          </ReduxProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
