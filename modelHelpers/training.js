import { brand } from '../colors'

export function rideColor(trainingRide, rideHorses, horses, defaultColor=brand) {
  let horseColor = defaultColor
  if (trainingRide.get('horseIDs').count() > 0) {
    const thisRidesHorse = rideHorses.filter(rh => {
      return rh.get('rideID') === trainingRide.get('rideID') && rh.get('rideHorseType') === 'rider'
    }).first()
    if (thisRidesHorse) {
      horseColor = horses.getIn([thisRidesHorse.get('horseID'), 'color']) || brand
    }
  }
  return horseColor
}