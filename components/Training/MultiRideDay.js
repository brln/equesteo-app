import { Text, TouchableOpacity, View } from "react-native"
import { rideColor } from "../../modelHelpers/training"
import { metersToFeet } from "../../helpers"
import React from "react"

export default function MultiRideDay (props) {
  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      {
        props.rides.map((r) => {
          const horseColor =  rideColor(r, props.horses, null)
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
                {r.get('distance').toFixed(1)}
              </Text>
            )
          } else if (props.chosenType === props.types.TYPE_TIME) {
            showString = props.timeString(
              r.get('elapsedTimeSecs'),
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
                {Math.round(metersToFeet(r.get('elevationGain'))) || 0}
              </Text>
            )
          }
          return (
            <TouchableOpacity key={r.get('rideID')} onPress={props.showRide(r)}>
              { showString }
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
}
