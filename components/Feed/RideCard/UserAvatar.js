import React, { PureComponent } from 'react'
import {
  Dimensions,
  View,
} from 'react-native'

import Thumbnail from '../../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class UserAvatar extends PureComponent {
  render () {
    let avatar = null
    if (this.props.userID !== this.props.rideUser.get('_id') || !this.props.ownRideList) {
      avatar = (
        <View style={{paddingRight: 5}}>
          <Thumbnail
            source={{uri: this.props.userProfilePhotoURL}}
            emptySource={require('../../../img/empty.png')}
            empty={!this.props.userProfilePhotoURL}
            height={width / 9}
            width={width/ 9}
            round={true}
          />
        </View>
      )
    }
    return avatar
  }
}

