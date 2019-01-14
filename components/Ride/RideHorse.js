import React, { PureComponent } from 'react'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { logError } from '../../helpers'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class RideHorse extends PureComponent {
  constructor(props) {
    super(props)
    this.horseProfileURL = this.horseProfileURL.bind(this)
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

  horseProfileURL (horse) {
    if (horse) {
      const profilePhotoID = horse.get('profilePhotoID')
      if (horse && profilePhotoID &&
        this.props.horsePhotos.get(profilePhotoID)) {
        return this.props.horsePhotos.getIn([profilePhotoID, 'uri'])
      }
    }
  }

  showHorseProfile () {
    this.props.showHorseProfile(this.props.horse, this.props.ownerID)
  }

  render () {
    const horseProfileURL = this.horseProfileURL(this.props.horse)
    return (
      <View style={{width: width / 2.3, padding: 10}}>
        <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={this.showHorseProfile}>
          <View style={{flex: 1.2, paddingRight: 10}}>
            <Thumbnail
              source={{uri: horseProfileURL}}
              emptySource={require('../../img/breed.png')}
              empty={!horseProfileURL}
              height={width / 8}
              width={width / 8}
              round={true}
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
