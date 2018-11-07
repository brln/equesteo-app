import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { orange } from '../../colors'
import { logError } from '../../helpers'
import URIImage from '../URIImage'

const { width } = Dimensions.get('window')

export default class Riders extends PureComponent {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
  }

  thumbnail (rider) {
    let profileThumb = (
      <BuildImage
        style={styles.thumbnail}
        source={require('../../img/emptyProfile.png')}
      />
    )

    if (rider.get('profilePhotoID')) {
      profileThumb = (
        <URIImage
          style={styles.thumbnail}
          source={{uri: this.props.userPhotos.getIn([rider.get('profilePhotoID'), 'uri'])}}
          onError={e => { logError('there was an error loading Riders image') }}
        />
      )
    }
    return (
      <TouchableOpacity
        key={rider.get('_id')}
        style={{marginRight: 5}}
        onPress={this.props.showRiderProfile(rider)}
      >
        { profileThumb }
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
