import React from 'react';
import renderer from 'react-test-renderer';

import DiscardModal from '../../../components/RideRecorder/DiscardModal'

test('renders very little when closed', () => {
  const tree = renderer.create(
    <DiscardModal
      modalOpen={false}
      closeDiscardModal={() => {}}
      discardFunc={() => {}}
      text={"Go Away."}
    />).toJSON();
  expect(tree).toMatchSnapshot()
});

test('renders more when open', () => {
  const tree = renderer.create(
    <DiscardModal
      modalOpen={true}
      closeDiscardModal={() => {}}
      discardFunc={() => {}}
      text={"Go Away."}
    />).toJSON();
  expect(tree).toMatchSnapshot()
});
