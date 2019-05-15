import { brand } from '../colors'

export function rideColor(trainingRide, horses, defaultColor=brand) {
  let horseColor = defaultColor
  if (trainingRide.get('riderHorseID')) {
    horseColor = horses.getIn([trainingRide.get('riderHorseID'), 'color'])
  }
  return horseColor
}