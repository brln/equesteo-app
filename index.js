import App from './App';
import { AppRegistry } from 'react-native';
import bgMessaging from './bgMessaging'

const app = new App();

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);

