import React, { Component } from 'react';
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { orange } from '../../colors'

const { width } = Dimensions.get('window')

export default class HorseSelector extends Component {
  constructor (props) {
    super(props)
    this.thumbnail = this.thumbnail.bind(this)
    this.changeHorseID = this.changeHorseID.bind(this)
  }

  changeHorseID(horseID) {
    return () => {
      this.props.changeHorseID(horseID)
    }
  }

  thumbnail (horse, style) {
    let source = require('../../img/emptyHorseBlack.png')
    if (horse.get('profilePhotoID')) {
      source = {uri: horse.getIn(['photosByID', horse.get('profilePhotoID')]).uri}
    }
    return (
      <TouchableOpacity
        key={horse.get('_id')}
        style={styles.photoThumbnail}
        onPress={this.changeHorseID(horse.get('_id'))}
      >
        <Image
          style={style}
          square
          source={source}
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
            }}}>{horse.get('name')}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const thumbnails = this.props.horses.map((h) => {
      const style = h.get('_id') === this.props.horseID ? styles.chosenThumb : styles.thumbnail
      return this.thumbnail(
        h,
        style,
      )
    })
    const noneStyle = this.props.horseID ? styles.thumbnail : styles.chosenThumb
    thumbnails.push(
      <TouchableOpacity
        style={[{borderColor: 'black', borderWidth: 1}, noneStyle, {margin: 5}]}
        key='none'
        onPress={this.changeHorseID(null)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 5}}>
          <Text>
            None
          </Text>
        </View>
      </TouchableOpacity>
    )
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
  photoThumbnail: {
    padding: 5
  },
  thumbnail: {
    width: width / 4,
    height: width / 4,
  },
  chosenThumb: {
    width: width / 4,
    height: width / 4,
    borderWidth: 5,
    borderColor: orange
  }
});
