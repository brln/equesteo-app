console.log('starting up')
import start from './App';
import { AppRegistry } from 'react-native';
import bgMessaging from './bgMessaging'

console.log('starting-========================================================================')
const store = start()
const withStore = bgMessaging(store)
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => withStore )

