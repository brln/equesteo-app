import { brand } from '../colors'

export function rideColor(trainingRide, horses, defaultColor=brand) {
  let horseColor = defaultColor
  if (trainingRide.get('horseIDs').count() > 0) {
    const firstHorseID = trainingRide.getIn(['horseIDs', 0])
    const firstHorse = horses.get(firstHorseID)
    if (firstHorse && firstHorse.get('color')) {
      horseColor = firstHorse.get('color')
    }
  }
  return horseColor
}