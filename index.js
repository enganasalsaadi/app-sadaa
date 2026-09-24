import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './src/app/App';
import { name as appName } from './app.json';
import { registerNotificationBackgroundHandlers } from './src/core/notification';

enableScreens(true);
registerNotificationBackgroundHandlers();
AppRegistry.registerComponent(appName, () => App);
