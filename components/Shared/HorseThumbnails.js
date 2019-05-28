import React, { PureComponent } from 'react'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import Thumbnail from '../../components/Images/Thumbnail'
import { darkGrey } from '../../colors'

const { width } = Dimensions.get('window')

export default class HorseThumbnails extends PureComponent {
  constructor (props) {
    super(props)
  }

  horseProfileURL (horse, horsePhotos) {
    const profilePhotoID = horse.get('profilePhotoID')
    if (profilePhotoID && horsePhotos.get(profilePhotoID)) {
      return horsePhotos.getIn([profilePhotoID, 'uri'])
    }
  }

  showHorseProfile (horse) {
    return () => {
      const owner = this.props.horseOwnerIDs.get(horse.get('_id'))
      this.props.showHorseProfile(horse, owner)
    }
  }

  oneHorse (horse) {
    const horseProfileURL = this.horseProfileURL(horse, this.props.horsePhotos)
    return (
      <View key={horse.get('_id')} style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
        <TouchableOpacity
          style={{flex: 1}}
          onPress={this.showHorseProfile(horse)}
        >
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text numberOfLines={1} style={{color: darkGrey, fontSize: 12, textAlign: 'center'}}>{horse.get('name')}</Text>
            <Thumbnail
              source={{uri: horseProfileURL}}
              emptySource={require('../../img/breed.png')}
              empty={!horseProfileURL}
              height={width / 10}
              width={width / 10}
              round={true}
              borderColor={horse.get('color') || null}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  andMore () {
    if (this.props.horses.count() > 2) {
      return (
        <View key={'num'} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 18}}>+{this.props.horses.count() - 2}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  render () {
    const twoHorses = this.props.horses.slice(0, 2).map(h => this.oneHorse(h))
    return (
      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
        { twoHorses }
        { this.andMore() }
      </View>
    )
  }
}
