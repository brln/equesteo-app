import { rideColor } from "../../modelHelpers/training"
import { Text, TouchableOpacity, View } from "react-native"
import { metersToFeet } from "../../helpers"
import React from "react"

export default function RideDay (props) {
  const horseColor =  rideColor(props.ride, props.horses, null)
  let showString
  if (props.chosenType === props.types.DISTANCE) {
    showString = (
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: horseColor
        }}
      >
        {props.ride.get('distance').toFixed(1)}
      </Text>
    )
  } else if (props.chosenType === props.types.TYPE_TIME) {
    showString = props.timeString(
      props.ride.get('elapsedTimeSecs'),
      {textAlign: 'center', fontSize: 15, fontWeight: 'bold'},
      false
    )
  } else if (props.chosenType === props.types.TYPE_GAIN) {
    showString = (
      <Text style={{
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold'}}
      >
        {Math.round(metersToFeet(props.ride.get('elevationGain')) || 0)}
      </Text>
    )

  }
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <TouchableOpacity onPress={props.showRide(props.ride)}>
        { showString }
      </TouchableOpacity>
    </View>
  )
}
