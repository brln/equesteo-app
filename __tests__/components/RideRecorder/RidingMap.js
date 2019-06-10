import { fromJS, Map } from 'immutable'
import React from 'react';
import renderer from 'react-test-renderer';

import { unixTimeNow } from '../../../helpers'
import RidingMap from '../../../components/RideRecorder/RidingMap'

test('renders', () => {
  const rideCoords = fromJS({rideCoordinates: [[1, 1, 1, 1]]})
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
      setMapRef={() => {}}
      userControlledMap={false}
      zoomLevel={2}
    />).toJSON();
  expect(tree).toMatchSnapshot()
});
