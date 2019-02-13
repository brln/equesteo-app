import React, { PureComponent } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'

import BuildImage from '../Images/BuildImage'
import { brand } from '../../colors'

export default class TabBar extends PureComponent {
  constructor (props) {
    super(props)
  }

  render() {
    return Platform.select({
      ios: (
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: brand}}>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openRecorder}>
            <BuildImage source={require('../../img/runningHorse.png')} style={{width: 35, height: 35}} />
            <Text style={{color: 'white', textAlign: 'center'}}>Go Ride!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openTraining}>
            <BuildImage source={require('../../img/diary.png')} style={{width: 35, height: 35}} />
            <Text style={{color: 'white', textAlign: 'center'}}>Training</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}} onPress={this.props.openLeaderboards}>
            <BuildImage source={require('../../img/leaderboard.png')} style={{width: 35, height: 35}} />
            <Text style={{color: 'white', textAlign: 'center'}}>Leaderboards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, alignItems: 'center'}}>
            <BuildImage source={require('../../img/more.png')} style={{width: 35, height: 35}} />
            <Text style={{color: 'white', textAlign: 'center'}}>More</Text>
          </TouchableOpacity>
        </View>
      ),
      android: null
    })
  }
}

