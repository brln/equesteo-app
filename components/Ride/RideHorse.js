import React, { PureComponent } from 'react'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { logError } from '../../helpers'

const { width } = Dimensions.get('window')

export default class RideHorse extends PureComponent {
  constructor(props) {
    super(props)
    this.showHorseProfile = this.showHorseProfile.bind(this)
  }

  header (rideHorseType) {
    switch (rideHorseType) {
      case 'rider':
        return 'Rode'
      case 'otherRider':
        return 'Other Rider'
      case 'ponied':
        return 'Ponied'
      case 'packed':
        return 'Packed'
      case 'drove':
        return 'Drove'
    }
  }

  showHorseProfile () {
    this.props.showHorseProfile(this.props.horse, this.props.ownerID)
  }

  render () {
    return (
      <View style={{width: width / 2.3, padding: 10}}>
        <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={this.showHorseProfile}>
          <View style={{flex: 1, paddingRight: 10}}>
            <BuildImage
              source={this.props.imgSrc}
              style={{flex: 1, height: null, width: null, resizeMode: 'contain'}}
              onError={e => logError("Can't load RideHorse image")}
            />
          </View>
          <View style={{flex: 3}}>
            <View>
              <Text>{this.header(this.props.rideHorse.get('rideHorseType'))}</Text>
            </View>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>{this.props.horse.get('name')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}
