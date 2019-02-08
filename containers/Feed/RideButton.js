import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'

import { brand } from '../../colors'

const RideButton = (props) => {
  return (
    <View style={{borderWidth: 3, borderColor: brand}}>
      <TouchableOpacity onPress={props.onPress} style={{alignItems: 'center', justifyContent: 'center', width: 100, height: 30, borderWidth: 2, borderColor: 'white'}}>
        <Text style={{color: 'white', textAlign: 'center'}}>{ props.currentRide ? 'Continue Ride' : 'Start Ride!'}</Text>
      </TouchableOpacity>
    </View>
  )
}

function mapStateToProps (state) {
  const currentRideState = state.get('currentRide')
  return {
    currentRide: currentRideState.get('currentRide'),
  }
}

export default connect(mapStateToProps)(RideButton)
