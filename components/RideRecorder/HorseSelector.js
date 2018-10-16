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

export default class HorseSelector extends PureComponent {
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
    let horseThumb = (
      <BuildImage
        source={require('../../img/emptyHorseBlack.png')}
        style={styles.thumbnail}
      />
    )

    if (horse.get('profilePhotoID')) {
      horseThumb = (
        <URIImage
          source={{uri: horse.getIn(['photosByID', horse.get('profilePhotoID'), 'uri'])}}
          style={styles.thumbnail}
          onError={(e) => { logError('there was an error loading HorseSelector avatar') }}
        />
      )

    }
    return (
      <TouchableOpacity
        key={horse.get('_id')}
        style={[style, {marginRight: 5}]}
        onPress={this.changeHorseID(horse.get('_id'))}
      >
        { horseThumb }
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
    const thumbnails = this.props.horses.reduce((accum, h) => {
      const style = h.get('_id') === this.props.horseID ? styles.chosenThumb : styles.thumbnail
      accum.push(this.thumbnail(
        h,
        style,
      ))
      return accum
    }, [])
    const noneStyle = this.props.horseID ? styles.thumbnail : [styles.thumbnail, styles.chosenThumb]
    thumbnails.push(
      <TouchableOpacity
        key={null}
        style={[noneStyle, {marginRight: 5}]}
        onPress={this.changeHorseID(null)}
      >
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
              width: -2,
              height: 2
            }}}>None</Text>
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
  thumbnail: {
    width: width / 4,
    height: width / 4,
  },
  chosenThumb: {
    borderWidth: 5,
    borderColor: orange
  }
});
