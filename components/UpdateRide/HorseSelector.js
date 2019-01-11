import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import BuildImage from '../Images/BuildImage'
import { orange } from '../../colors'
import { logError } from '../../helpers'
import URIImage from '../Images/URIImage'

const { width } = Dimensions.get('window')

export default class HorseSelector extends PureComponent {
  constructor (props) {
    super(props)
    this.isChosen = this.isChosen.bind(this)
    this.thumbnail = this.thumbnail.bind(this)
    this.openSelectHorseMenu = this.openSelectHorseMenu.bind(this)
    this.unselectHorse = this.unselectHorse.bind(this)
  }

  openSelectHorseMenu(horseID) {
    return () => {
      this.props.openSelectHorseMenu(horseID)
    }
  }

  unselectHorse(horseID) {
    return () => {
      this.props.unselectHorse(horseID)
    }
  }

  thumbnail (horse, style, onPress) {
    let horseThumb = (
      <BuildImage
        source={require('../../img/emptyHorseBlack.png')}
        style={styles.thumbnail}
      />
    )

    if (horse.get('profilePhotoID')) {
      horseThumb = (
        <URIImage
          source={{uri: this.props.horsePhotos.getIn([horse.get('profilePhotoID'), 'uri'])}}
          style={styles.thumbnail}
          onError={(e) => { logError('there was an error loading HorseSelector avatar') }}
        />
      )

    }
    return (
      <TouchableOpacity
        key={horse.get('_id')}
        style={[style, {marginRight: 5}]}
        onPress={onPress}
      >
        { horseThumb }
        <View style={styles.horseCard}>
          <Text style={styles.horseName}>{horse.get('name')}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  isChosen (horse) {
    let chosen = false
    if (this.props.horseID === horse.get('_id')) {
      chosen = true
    } else {
      this.props.rideHorses.valueSeq().forEach(rideHorse => {
        if (rideHorse.get('deleted') !== true
          && rideHorse.get('horseID') === horse.get('_id'))    {
            chosen = true
          }
      })
    }
    return chosen
  }

  render () {
    const thumbnails = this.props.horses.reduce((accum, h) => {
      let style = styles.thumbnail
      let onPress = this.openSelectHorseMenu(h.get('_id'))
      if (this.isChosen(h)) {
         style = styles.chosenThumb
         onPress = this.unselectHorse(h.get('_id'))
      }
      accum.push(this.thumbnail(h, style, onPress))
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
  },
  horseName: {
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 5,
    textShadowOffset: {
      width: -1,
      height: 1
    }
  },
  horseCard: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    left: 5,
    right: 5,
    top: 5,
    bottom: 5,
    padding: 5
  }
});
