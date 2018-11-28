import { Map } from 'immutable'
import React from 'react';
import renderer from 'react-test-renderer';

import { unixTimeNow } from '../../../helpers'
import RideStats from '../../../components/RideRecorder/RideStats'

test('renders nothing when not visible', () => {
  const currentRide = Map({
    startTime: unixTimeNow()
  })
  const tree = renderer.create(
    <RideStats
      currentRide={currentRide}
      visible={false}
  />).toJSON();
  expect(tree).toBeNull()
});

test('renders', () => {
  const currentRide = Map({
    startTime: unixTimeNow(),
    distance: 32
  })
  const currentRideElevations = Map({
    elevationGain: 20
  })

  const tree = renderer.create(
    <RideStats
      currentRide={currentRide}
      currentRideElevations={currentRideElevations}
      visible={true}
    />).toJSON();
  expect(tree).toMatchSnapshot()
});
