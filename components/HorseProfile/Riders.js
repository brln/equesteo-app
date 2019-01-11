import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { brand, orange } from '../../colors'
import { logError } from '../../helpers'
import { userName } from '../../modelHelpers/user'
import Thumbnail from '../Images/Thumbnail'
import URIImage from '../Images/URIImage'

const { width } = Dimensions.get('window')

export default class Riders extends PureComponent {
  constructor (props) {
    super(props)
    this.addNew = this.addNew.bind(this)
    this.thumbnail = this.thumbnail.bind(this)
  }

  thumbnail (rider) {
    return (
      <Thumbnail
        borderColor={'transparent'}
        key={rider.get('_id')}
        empty={!rider.get('profilePhotoID')}
        emptySource={require('../../img/emptyProfile.png')}
        source={{uri: this.props.userPhotos.getIn([rider.get('profilePhotoID'), 'uri'])}}
        onPress={this.props.showRiderProfile(rider)}
        width={width / 4}
        height={width / 4}
        textOverlay={ userName(rider) }
      />
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
