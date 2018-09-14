import start from './App';
import { AppRegistry } from 'react-native';
import bgMessaging from './bgMessaging'

start()

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);

