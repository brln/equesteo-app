import React, { PureComponent } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { orange } from '../../colors'
import { logError } from '../../helpers'

const { width } = Dimensions.get('window')

export default class Riders extends PureComponent {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
  }

  thumbnail (rider) {
    let source = require('../../img/emptyProfile.png')
    if (rider.get('profilePhotoID')) {
      source = {uri: rider.getIn(['photosByID', rider.get('profilePhotoID'), 'uri'])}
    }
    return (
      <TouchableOpacity
        key={rider.get('_id')}
        style={{marginRight: 5}}
        onPress={this.props.showRiderProfile(rider)}
      >
        <Image
          square
          style={styles.thumbnail}
          source={source}
          onError={(e) => { logError('there was an error loading Riders image') }}
        />
        <View style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          left: 5,
          right: 5,
          top: 5,
          bottom: 5,
          padding: 5
        }}>
          <Text style={{
            textAlign: 'center',
            color: 'white',
            textShadowColor: 'black',
            textShadowRadius: 5,
            textShadowOffset: {
              width: -1,
              height: 1
            }}}>{rider.get('firstName')} {rider.get('lastName')}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const thumbnails = this.props.riders.reduce((accum, r) => {
      accum.push(this.thumbnail(r))
      return accum
    }, [])
    return (
      <View style={styles.photoContainer}>
        {thumbnails}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: width / 4,
    height: width / 4,
  },
  chosenThumb: {
    borderWidth: 5,
    borderColor: orange
  }
});
