import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../BuildImage'
import { brand, orange } from '../../colors'
import { logError } from '../../helpers'
import { userName } from '../../modelHelpers/user'
import URIImage from '../URIImage'

const { width } = Dimensions.get('window')

export default class Riders extends PureComponent {
  constructor (props) {
    super(props)
    this.addNew = this.addNew.bind(this)
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
        <View style={styles.nameView}>
          <Text style={styles.nameText}>{ userName(rider) }</Text>
        </View>
      </TouchableOpacity>
    )
  }

  addNew () {
    let add = null
    if (this.props.riders.indexOf(this.props.user) < 0) {
      add = (
        <TouchableOpacity
          style={[styles.thumbnail, {
            marginRight: 5,
            backgroundColor: brand,
          }]}
          onPress={this.props.addRider}
        >
          <View style={styles.nameView}>
            <Text style={styles.nameText}>I Ride This Horse</Text>
            <BuildImage source={require('../../img/addUser.png')} style={{width: width / 12, height: width / 12}}/>
          </View>
        </TouchableOpacity>
      )
    } else {

      add = (
        <TouchableOpacity
          style={[styles.thumbnail, {
            marginRight: 5,
            backgroundColor: brand,
          }]}
          onPress={this.props.deleteHorse}
        >
          <View style={styles.nameView}>
            <Text style={styles.nameText}>I Don't Ride This Horse</Text>
            <BuildImage source={require('../../img/deleteUser.png')} style={{width: width / 12, height: width / 12}}/>
          </View>
        </TouchableOpacity>
      )
    }
    return add
  }

  render () {
    const thumbnails = this.props.riders.reduce((accum, r) => {
      accum.push(this.thumbnail(r))
      return accum
    }, [])
    return (
      <View style={styles.photoContainer}>
        {thumbnails}
        {this.addNew()}
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
  },
  nameView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 5,
    right: 5,
    top: 5,
    bottom: 5,
    padding: 5
  },
  nameText: {
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 5,
    textShadowOffset: {
      width: -1,
      height: 1
    }
  }
});
