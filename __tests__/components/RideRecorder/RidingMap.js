import { List, Map } from 'immutable'
import React from 'react';
import renderer from 'react-test-renderer';

import { unixTimeNow } from '../../../helpers'
import RidingMap from '../../../components/RideRecorder/RidingMap'

test('renders', () => {
  const rideCoords = List([List([1, 1, 1, 1])])
  const mapRegionChanged = () => {}
  const recenter = () => {}
  const tree = renderer.create(
    <RidingMap
      currentRideCoordinates={rideCoords}
      heading={1}
      centerCoordinate={[1, 1]}
      lastLocation={Map({latitude: 1, longitude: 1})}
      mapRegionChanged={mapRegionChanged}
      recenter={recenter}
      refiningLocation={Map({latitude: 1, longitude: 1})}
      userControlledMap={false}
      zoomLevel={2}
Map
    />).toJSON();
  expect(tree).toMatchSnapshot()

});
