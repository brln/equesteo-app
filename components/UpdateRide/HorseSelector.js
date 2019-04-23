import React, { PureComponent } from 'react';
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native';

import { darkGrey, orange } from '../../colors'
import Thumbnail from '../Images/Thumbnail'

const { width } = Dimensions.get('window')

export default class HorseSelector extends PureComponent {
  constructor (props) {
    super(props)
    this.isChosen = this.isChosen.bind(this)
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

  isChosen (horse) {
    let chosen = false
    this.props.rideHorses.valueSeq().forEach(rideHorse => {
      if (rideHorse.get('deleted') !== true
        && rideHorse.get('horseID') === horse.get('_id'))    {
          chosen = true
        }
    })
    return chosen
  }

  render () {
    const thumbnails = this.props.horses.reduce((accum, h) => {
      let onPress = this.openSelectHorseMenu(h.get('_id'))
      let isChosen = this.isChosen(h)
      let borderColor = darkGrey
      if (isChosen) {
        borderColor = orange
        onPress = this.unselectHorse(h.get('_id'))
      }
      accum.push(
        <Thumbnail
          key={h.get('_id')}
          borderColor={borderColor}
          source={{uri: this.props.horsePhotos.getIn([h.get('profilePhotoID'), 'uri'])}}
          emptySource={require('../../img/emptyHorseBlack.png')}
          empty={!h.get('profilePhotoID')}
          height={width / 4}
          width={width / 4}
          onPress={onPress}
          padding={3}
          textOverlay={h.get('name')}
        />
      )
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
