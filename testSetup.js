jest.mock('react-native-navigation', () => 'RNNavigation');
jest.mock('react-native-firebase', () => 'RNFirebase');
jest.mock('pouchdb-react-native', () => 'PouchDB');
jest.mock('react-native-camera', () => 'RNCamera')
jest.mock('@mapbox/react-native-mapbox-gl', () => {
  return {
    StyleSheet: {
      identity: () => 'MapboxGL',
      create: () => 'MapboxGL',
    }
  }
})
