import start from './App';
import { AppRegistry } from 'react-native';
import bgMessaging from './bgMessaging'

const store = start()
const withStore = bgMessaging(store)
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => withStore )

